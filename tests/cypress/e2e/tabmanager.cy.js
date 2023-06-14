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
    defaultControllerId: '',
    defaultUrl: "",
    pages: [
        { url: '', id: 'products' },
        { url: '', id: 'blogs' },
    ],
    tabs: [
        {
            controllerid: 'products',
            label: 'Products',
            resultSelector: ".ss__result--item"
        },
        {
            controllerid: "blogs",
            label: 'Articles',
            resultSelector: ".ss__blog-results .ss__result--item"
        }
    ],
    selectors: {
        tabButton: ".ss__tab-switcher__tab",
        active: ".active"
    }
};


describe('Tab Manager', () => {
    const defaultTabSetting = config.tabs.filter(tab => tab.controllerid == config.defaultControllerId)[0];

    /**********************************************
	* DO NOT MOVE, SKIP, OR EDIT THE SET UP TESTS *
	**********************************************/
    describe('Setup', function () {
        it('uses default tab', function () {
            if (!config.tabs) this.skip();
            if (config.defaultControllerId && config.defaultUrl){

                cy.visit(config.defaultUrl);

                cy.addLocalSnap();

                cy.waitForBundle().then(() => {
                    cy.window().then(window => {
                        expect(window.searchspring).to.exist;
                    });
                });

                if (config.disableGA) {
                    window[`ga-disable-${config.disableGA}`] = true;
                }

                cy.snapController(config.defaultControllerId).then(({ store }) => {

                    expect(Object.keys(store.services.urlManager).length).to.greaterThan(0);
                    expect(store.services.urlManager.state.view[0]).to.equal(config.defaultControllerId);
                    cy.get(config.selectors.tabButton + config.selectors.active).first().should('exist').contains(`${defaultTabSetting.label}`);
                    cy.get(defaultTabSetting.resultSelector).should('exist').should('have.length', store.pagination.pageSize);
                })
            }
        })
    })		

    it('auto switch tabs based off url', function () {
        if (!config.tabs || !config.pages) this.skip();

        config.pages.forEach((tabbedPage, _i) => {
            describe(`${tabbedPage.id || _i}`, () => {
    
                cy.visit(`${tabbedPage.url}`);
                cy.addLocalSnap();
                
                cy.waitForBundle().then(() => {
                    cy.window().then(window => {
                        expect(window.searchspring).to.exist;
                    });
                });

                if (config.disableGA) {
                    window[`ga-disable-${config.disableGA}`] = true;
                }

                cy.snapController(tabbedPage.id).then(({ store }) => {
                    expect(typeof store).to.equal('object');

                    const newSelectedTab = config.tabs.filter(tab => tab.controllerid == tabbedPage.id)[0];

                    expect(store.services.urlManager.state.view[0]).to.equal(tabbedPage.id);
                    cy.get(config.selectors.tabButton + config.selectors.active).first().should('exist').contains(`${newSelectedTab.label}`);		
                    cy.get(newSelectedTab.resultSelector).should('exist').should('have.length', store.pagination.pageSize)
                });
            })
        })
    });

    it('can manually switch tabs', function () {
        if (!config.tabs) this.skip();

        cy.get(config.selectors.tabButton).each(tabElem => {
            if (tabElem[0].innerHTML.indexOf(`${defaultTabSetting.label}`) > -1){
                return;
            }else {

                cy.get(tabElem).first().should('exist').click({ force: true }); 

                cy.wait(300);

                const newSelectedTab = config.tabs.filter(tab => tab.label == tabElem[0].innerHTML)[0];

                cy.snapController(newSelectedTab.controllerid).then(({ store }) => {
                    expect(store.services.urlManager.state.view[0]).to.equal(newSelectedTab.controllerid);
                    expect(store.services.urlManager.state.view[0]).not.to.equal(defaultTabSetting.controllerid);
                    cy.get(config.selectors.tabButton + config.selectors.active).first().should('exist').contains(`${newSelectedTab.label}`);		
                    cy.get(newSelectedTab.resultSelector).should('exist').should('have.length', store.pagination.pageSize);
        
                });
            }	
        })
    })
});

