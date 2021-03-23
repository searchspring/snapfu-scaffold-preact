// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

beforeEach(() => {
	cy.blockResources([
		'https://widget.privy.com/assets/widget.js',
		'cdn.searchspring.net/search/', // v3 resources
		'cdn.searchspring.net/autocomplete/', // v2 AC resources
		'cdn.searchspring.net/ajax_search/js/', // v2 resources
	]);

	// make references to requests available
	cy.intercept('searchspring.io/api/v1/search').as('search');
	cy.intercept('searchspring.io/api/v1/autocomplete').as('autocomplete');
	cy.intercept('searchspring.io/api/v1/meta').as('meta');
});
