// DO NOT EDIT - THIS FILE CAN/WILL BE REPLACED!!!
// ***********************************************
// Custom Snap Cypress Configuration
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************

// Import commands.js using ES2015 syntax:
import './commands';
import './custom';
import { ignoredErrors } from './custom';

// ignore 3rd party uncaught exceptions - but not bundle exceptions
Cypress.on('uncaught:exception', (err) => {
	if (ignoredErrors?.length) {
		for (let i = 0; i < ignoredErrors.length; i++) {
			const checkFor = new RegExp(ignoredErrors[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
			if (err.stack.match(checkFor)) {
				return false;
			}
		}
	}

	if (err.stack.match(/\/\/localhost:\d+\/bundle\./)) {
		return true;
	}

	return false;
});

beforeEach(() => {
	// make references to requests available
	cy.intercept(/.*searchspring.io\/api\/search\/search/).as('search');
	cy.intercept(/.*searchspring.io\/api\/search\/autocomplete/).as('autocomplete');

	// prevent v2 and v3 assets
	cy.intercept(/.*searchspring.net\/search\/*/, (req) => {
		req.destroy();
	});
	cy.intercept(/.*searchspring.net\/autocomplete\/*/, (req) => {
		req.destroy();
	});
	cy.intercept(/.*searchspring.net\/ajax_search\/js\/*/, (req) => {
		req.destroy();
	});

	// prevent snap assets
	cy.intercept(/.*snapui.searchspring.io\/.*.js$/, (req) => {
		req.destroy();
	});
});
