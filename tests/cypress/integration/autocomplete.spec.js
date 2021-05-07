const config = {
	url: '',
	disableGA: '',
	selectors: {
		autocomplete: {
			term: (num) => `#ss-ac-terms .ss-list-option${num ? `:nth-child(${num})` : ``} a`,
			facet: '.ss-ac-facet-container ul li a',
			result: '.ss-ac-item a',
			seeMore: 'a.ss-ac-see-more-link',
		},
	},
	startingQuery: 'w',
	autocompleteConfig: {
		id: 'autocomplete',
		selector: '#search_query',
		globals: {
			suggestions: {
				count: 4,
			},
			search: {
				query: {
					spellCorrection: true,
				},
			},
			pagination: {
				pageSize: 6,
			},
		},
	},
};

describe('Autocomplete', () => {
	describe('Setup', () => {
		it('adds snap bundle to autocomplete page', () => {
			cy.visit(config.url);
			cy.addLocalSnap(); // as @script

			if (config.disableGA) {
				window[`ga-disable-${config.disableGA}`] = true;
			}

			cy.wait('@script').should((script) => {
				expect(script.state).to.equal('Complete');
			});
		});
	});

	describe('Tests Autocomplete', () => {
		let term = config.startingQuery || null;
		it('can make single letter query', function () {
			if (!term && !config?.autocompleteConfig?.selector) this.skip();

			cy.get(config.autocompleteConfig.selector).should('exist').type(term).wait(1000);

			cy.wait('@autocomplete').should('exist');

			cy.snapStore(`autocomplete`).then((store) => {
				expect(store.terms.length).to.greaterThan(0);

				if (config.autocompleteConfig?.globals?.suggestions?.count) {
					expect(store.terms.length).to.lte(config.autocompleteConfig?.globals?.suggestions?.count);
				}

				term = store.terms[0].value;
			});
		});

		it('has correct count and term in see more link', () => {
			if (!config?.selectors?.autocomplete?.seeMore) this.skip();
			cy.snapStore(`autocomplete`).then((store) => {
				cy.get(config.selectors.autocomplete.seeMore).should('exist').contains(store.pagination.totalResults).contains(term);
			});
		});

		it('can clear input', function () {
			if (!config?.autocompleteConfig?.selector && !config?.startingQuery) this.skip();

			cy.get(config.autocompleteConfig.selector).should('exist').should('have.value', config.startingQuery).clear().should('have.value', '');
		});

		it('can make term query', function () {
			if (!config?.autocompleteConfig?.selector) this.skip();

			cy.get(config.autocompleteConfig.selector).should('exist').type(term).wait(1000);

			cy.wait('@autocomplete').should('exist');

			cy.snapStore(`autocomplete`).then((store) => {
				expect(store.terms.length).to.greaterThan(0);

				if (config.autocompleteConfig?.globals?.suggestions?.count) {
					expect(store.terms.length).to.lte(config.autocompleteConfig?.globals?.suggestions?.count);
				}

				expect(store.terms[0].value).to.equal(term);
			});
		});

		it('can hover over next term', function () {
			if (!config?.selectors?.autocomplete?.term() || !config?.selectors?.autocomplete?.term) this.skip();

			cy.snapStore(`autocomplete`).then((store) => {
				if (!store.terms.length > 1) this.skip();
				cy.get(`${config.selectors.autocomplete.term(2)}`)
					.should('exist')
					.trigger('focus')
					.invoke('text')
					.then((text) => {
						expect(text).to.equal(store.terms[1].value);
						term = text;
					});
			});
		});

		it('can hover over facet', function () {
			if (!config?.autocompleteConfig?.selector && !config?.selectors?.autocomplete?.facet) this.skip();

			cy.get(config.autocompleteConfig.selector).should('exist').clear().type(term).wait(1000);
			cy.snapStore(`autocomplete`).then((store) => {
				const totalResults = store.pagination.totalResults;
				if (!store.facets.length > 0 || !store.facets[0].values.length > 0) this.skip(); //skip if this term has no facets

				cy.get(config.selectors.autocomplete.facet).then((facets) => {
					const facet = facets[0];
					expect(facet.innerText).to.equal(store.facets[0].values[0].label);
					cy.get(facet).trigger('focus');
					cy.snapStore(`autocomplete`).then((store) => {
						expect(totalResults).to.greaterThan(store.pagination.totalResults);
					});
				});
			});
		});

		it('has results', function () {
			if (!config?.selectors?.autocomplete?.result) this.skip();

			cy.snapStore(`autocomplete`).then((store) => {
				if (!store.results.length) this.skip(); //skip if this term has no results
				cy.get(config.selectors.autocomplete.result)
					.should('have.length', store.results.length)
					.should('have.length', config.autocompleteConfig?.globals?.pagination?.pageSize || store.results.length)
					.each((result, index) => {
						cy.get(result).should('have.attr', 'href', store.results[index].mappings.core.url);
					});
			});
		});

		it('can click on see more link', function () {
			if (!config?.selectors?.autocomplete?.seeMore) this.skip();

			cy.snapStore(`autocomplete`).then((store) => {
				const expectedUrl = store.filters[0].controller.urlManager.href;
				cy.get(config.selectors.autocomplete.seeMore).should('have.attr', 'href', expectedUrl).click();
				cy.on('url:changed', (newUrl) => {
					expect(newUrl).to.contain(expectedUrl);
				});
			});
		});
	});
});
