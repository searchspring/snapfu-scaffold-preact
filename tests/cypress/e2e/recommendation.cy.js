/**
 * End to end tests with Cypress!
 *
 * The purpose of these tests is to prevent publishing of the bundle if a
 * breaking change has been made to the implementation code in the future
 *
 * Start by fill out the config object below. If a selector is not provided,
 * the applicable tests will be skipped.
 *
 */

const config = {
	url: 'https://localhost:3333/recommendation-default.html', // page containing recommendation
	disableGA: '', // disable google analytic events (example: 'UA-123456-1')
	controller: 'recommend_trending_0',
	selectors: {
		recommendation: {
			target: '.ss__recs__default',
			main: '.ss__recommendation',
			// selector of the wrapping element. Expects child element to contain <a>
			carousel: `.ss__recommendation .ss__carousel`,
			result: '.ss__result',
			resultTitle: '.ss__result__details__title',
			nextButton: '.ss__recommendation .ss__carousel__next',
			prevButton: '.ss__recommendation .ss__carousel__prev',
			activeSlide: '.ss__recommendation .swiper-slide-active',
		},
	},
};

describe('Recommendations', () => {
	/**********************************************
	 * DO NOT MOVE, SKIP, OR EDIT THE SETUP TESTS *
	 **********************************************/
	before('Setup', () => {
		cy.wrap(config).its('url').should('have.length.at.least', 1);
		cy.visit(config.url);

		cy.addLocalSnap();

		cy.waitForBundle().then(() => {
			cy.window().then((window) => {
				expect(window.searchspring).to.exist;
			});
		});

		if (config.disableGA) {
			window[`ga-disable-${config.disableGA}`] = true;
		}
	});

	describe('Tests Recommendations', () => {
		it('has a controller', function () {
			cy.snapController(config.controller).then(({ store }) => {
				expect(store.results.length).to.greaterThan(0);
			});
		});

		it('renders recommendations', function () {
			cy.snapController(config.controller).then(({ store }) => {
				cy.get(config.selectors.recommendation.target).scrollIntoView();

				cy.get(config?.selectors?.recommendation.main).should('exist');
				cy.get(config?.selectors?.recommendation.carousel).should('exist');
				cy.get(config?.selectors?.recommendation.result).should('exist');
			});
		});

		it('renders products that have URL values', function () {
			cy.snapController(config.controller).then(({ store }) => {
				cy.get(config?.selectors?.recommendation.resultTitle)
					.each(($title, index) => {
						cy.wrap($title).find('a').invoke('attr', 'href').then((url) => {
							expect(store.results[index].mappings.core.url).to.equal(url);
						});
					});
			});
		});

		it('renders carousel prev buttons', function () {
			cy.document().then((doc) => {
				cy.snapController(config.controller).then(({ store }) => {
					cy.get(config?.selectors?.recommendation.nextButton).should('exist');
					cy.get(config?.selectors?.recommendation.prevButton).should('exist');

					cy.get(config?.selectors?.recommendation.activeSlide).should('exist');

					// get the initial active product
					const intialActive = doc.querySelector(
						`${config?.selectors?.recommendation.activeSlide} ${config?.selectors?.recommendation.result} ${config?.selectors.recommendation.resultTitle}`
					).innerHTML;

					// click the prev button
					cy.get(config?.selectors?.recommendation.prevButton)
						.click({ force: true })
						.then(($button) => {
							const newerActiveTitle = doc.querySelector(
								`${config?.selectors?.recommendation.activeSlide} ${config?.selectors?.recommendation.result} ${config?.selectors.recommendation.resultTitle}`
							).innerHTML;

							// these should not match
							expect(newerActiveTitle).to.not.equal(intialActive);
						});
				});
			});
		});

		it('renders carousel next buttons', function () {
			cy.document().then((doc) => {
				cy.snapController(config.controller).then(({ store }) => {
					cy.get(config?.selectors?.recommendation.nextButton).should('exist');
					cy.get(config?.selectors?.recommendation.prevButton).should('exist');

					cy.get(config?.selectors?.recommendation.activeSlide).should('exist');

					// get the initial active product
					const intialActive = doc.querySelector(
						`${config?.selectors?.recommendation.activeSlide} ${config?.selectors?.recommendation.result} ${config?.selectors.recommendation.resultTitle}`
					).innerHTML;
					let newActive;
					// click the next button
					cy.get(config?.selectors?.recommendation.nextButton)
						.click({ force: true })
						.then(($button) => {
							cy.wait(500);
							// get the new active product
							newActive = doc.querySelector(
								`${config?.selectors?.recommendation.activeSlide} ${config?.selectors?.recommendation.result} ${config?.selectors.recommendation.resultTitle}`
							).innerText;

							// get the new active again
							const newerActiveIndex = doc.querySelector(`${config?.selectors?.recommendation.activeSlide}`).getAttribute('data-swiper-slide-index');
							const storeTitle = store.results[parseInt(newerActiveIndex)].mappings.core.name;

							// should have changed
							expect(newActive).to.not.equal(intialActive);
							expect(newActive).to.equal(storeTitle);
						});
				});
			});
		});
	});
});
