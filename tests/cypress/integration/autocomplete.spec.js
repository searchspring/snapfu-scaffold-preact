const config = {
	url: 'https://localhost:3333/index.html',
	disableGA: '',
	selectors: {
		website: {
			openInputButton: '',
			input: '.header-bar__search-input:first',
		},
		autocomplete: {
			term: `.ss__autocomplete .ss__autocomplete__terms__option`,
			facet: '.ss__autocomplete .ss__facet .ss__facet__options',
			result: '.ss__autocomplete .ss__results .ss__result',
			seeMore: '.ss__autocomplete .ss__autocomplete__content__info',
		},
	},
	startingQuery: 't',
};

describe('Autocomplete', () => {
	describe('Setup', () => {
		it('adds snap bundle to autocomplete page', () => {
			cy.visit(config.url);
			cy.addLocalSnap();

			cy.waitForBundle().then(() => {
				cy.window().then(window => {
					expect(window.searchspring).to.exist;
				});
			});

			if (config.disableGA) {
				window[`ga-disable-${config.disableGA}`] = true;
			}
		});
	});

	describe('Tests Autocomplete', () => {
		let term = config.startingQuery || null;

		it('has a controller with an empty store', function () {
			cy.snapController('autocomplete').then(({ store }) => {
				expect(store.results.length).to.equal(0);
				expect(store.terms.length).to.equal(0);
				expect(store.state.input).to.equal(undefined);
			});
		});

		it('can make single letter query', function () {
			if (!term && !config?.selectors?.website?.input) this.skip();

			if (config.selectors.website.openInputButton) {
				cy.get(config.selectors.website.openInputButton).first().click({ force: true });
			}

			cy.get(config.selectors.website.input).first().should('exist').focus().type(term, {force: true});

			cy.wait('@autocomplete').should('exist');

			cy.snapController('autocomplete').then(({ store }) => {
				expect(store.terms.length).to.greaterThan(0);

				term = store.terms[0].value;
			});
		});

		it('has correct count and term in see more link', () => {
			if (!config?.selectors?.autocomplete?.seeMore) this.skip();
			cy.snapController('autocomplete').then(({ store }) => {
				cy.get(config.selectors.autocomplete.seeMore).should('exist').contains(store.pagination.totalResults).contains(term);
			});
		});

		it('can clear input', function () {
			if (!config?.selectors?.website?.input && !config?.startingQuery) this.skip();

			cy.get(config.selectors.website.input).first().should('exist').should('have.value', config.startingQuery).clear({force: true}).should('have.value', '');
		});

		it('can make term query', function () {
			if (!config?.selectors?.website?.input) this.skip();

			cy.get(config.selectors.website.input).first().should('exist').type(term, {force: true});

			cy.wait('@autocomplete').should('exist');

			cy.snapController('autocomplete').then(({ store }) => {
				expect(store.terms.length).to.greaterThan(0);

				expect(store.terms[0].value).to.equal(term);
			});
		});

		it('can hover over next term', function () {
			if (!config?.selectors?.autocomplete?.term) this.skip();

			cy.snapController('autocomplete').then(({ store }) => {
				if (!store.terms.length > 1) this.skip();
				cy.get(`${config.selectors.autocomplete.term}`)
					.eq(1)
					.find('a')
					.should('exist')
					.trigger('focus', {force: true})
					.invoke('text')
					.then((text) => {
						expect(text).to.equal(store.terms[1].value);
						term = text;
					});
			});
		});

		it('can hover over facet', function () {
			if (!config?.selectors?.input && !config?.selectors?.autocomplete?.facet) this.skip();

			cy.get(config.selectors.website.input).first().should('exist').clear({force: true}).type(term, {force: true});

			cy.wait('@autocomplete').should('exist');

			cy.snapController('autocomplete').then(({ store }) => {
				const totalResults = store.pagination.totalResults;
				if (!store.facets.length > 0 || !store.facets[0].values.length > 0) this.skip(); //skip if this term has no facets

				cy.get(`${config.selectors.autocomplete.facet} a`).then((facetOptions) => {
					const firstOption = facetOptions[0];
					expect(firstOption.innerText).to.contain(store.facets[0].values[0].label);
					cy.get(firstOption).trigger('focus');
					cy.snapController('autocomplete').then(({ store }) => {
						expect(totalResults).to.be.at.least(store.pagination.totalResults);
					});
				});
			});
		});

		it('has results', function () {
			if (!config?.selectors?.autocomplete?.result) this.skip();

			cy.snapController('autocomplete').then(({ store }) => {
				if (!store.results.length) this.skip(); //skip if this term has no results
				cy.get(`${config.selectors.autocomplete.result} a:first`)
					.should('have.length.greaterThan', 0)
					.each((result, index) => {
						cy.get(result).should('have.attr', 'href', store.results[index].mappings.core.url);
					});
			});
		});

		it('can click on see more link', function () {
			if (!config?.selectors?.autocomplete?.seeMore) this.skip();

			cy.snapController('autocomplete').then((controller) => {
				cy.get(`${config.selectors.autocomplete.seeMore} a[href$="${controller.urlManager.href}"]`).should('exist').click({ force: true });
				cy.on('url:changed', (newUrl) => {
					expect(newUrl).to.contain(controller.urlManager.href);
				});
			});
		});
	});
});