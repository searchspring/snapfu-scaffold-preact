const config = {
	url: '',
	disableGA: '',
	selectors: {
		finder: {
			findButton: 'button',
		},
	},
	finderConfigs: [
		{
            id: 'Finder',
            url: '/collections/shop',
            selector: '.searchspring-desktop-finder',
            className: 'ss-vehicle-finder',
            persist: {
                enabled: true,
                lockSelections: false,
            },
            fields: [
                {
                    field: 'ss_ymm',
                    levels: ['Year', 'Make', 'Model', 'Engine'],
                },
            ],
        },
	],
};

config?.finderConfigs?.forEach((finder, _i) => {
	describe(`${finder.id || _i}`, () => {

		let isHierarchy = undefined;

		describe('Setup', () => {

			it('adds snap bundle to finder page', function () {
				if(!config.url) this.skip();

				cy.on('uncaught:exception', (err, runnable) => false);
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

				cy.snapController(finder?.id).then(({ store }) => {
					expect(typeof store).to.equal('object');
				});
			});

			it('has data in the store', function () {
				if(!config.url) this.skip();


				cy.snapController(finder?.id).then(({ store }) => {
					expect(store).to.haveOwnProperty('selections');
					expect(store).to.haveOwnProperty('storage');
				});
			});

			it('determines if Hierarchy or not', function () {
				if(!config.url) this.skip();

				cy.snapController(finder?.id).then(({ store }) => {
					const facet = finder.fields.map((field) => {
						return store.meta.facets[field.field];
					})[0];
					if (facet?.display) {
						isHierarchy = facet.display === 'hierarchy';
					}
				});
			});
		});

		describe('Tests Hierarchy', () => {
			
			it('has correct number of dropdowns', function () {
				if(!config.url) this.skip();

				if (!isHierarchy) this.skip();
				cy.snapController(finder?.id).then(({ store }) => {
					cy.get(finder.selector).find('select').should('exist').should('have.length', store.selections.length);
				});
			});

			it('only first select enabled', function () {
				if(!config.url) this.skip();

				if (!isHierarchy) this.skip();
				cy.snapController(finder?.id).then(({ store }) => {
					cy.get(finder.selector)
						.find('select')
						.each((select, index) => {
							select = select[0];
							if (index === 0) {
								expect(select.disabled).to.equal(false);
							} else {
								expect(select.disabled).to.equal(true);
							}
						});
				});
			});

			it('other select have expected disable state', function () {
				if(!config.url) this.skip();

				if (!isHierarchy) this.skip();
				cy.snapController(finder?.id).then(({ store }) => {
					cy.get(finder.selector)
						.find('select')
						.each((select, index) => {
							select = select[0];
							expect(select.disabled).to.equal(store.selections[index].disabled);
						});
				});
			});

			it('can make all selections in order', function () {
				if(!config.url) this.skip();

				if (!isHierarchy) this.skip();
				cy.snapController(finder?.id).then(({ store }) => {
					store.selections.map((selection, index) => {
						cy.get(finder.selector)
							.find('select')
							.then((select) => {
								if (!select.length > index) this.skip();

								select = select[index];
								const values = store.selections[index].data && store.selections[index].data.filter((option) => option.count > 1);
								const valueToSelect = values?.length && values[values.length - 1]?.value;
								if(valueToSelect){
									cy.get(select).select(valueToSelect, { force: true });
									cy.snapController(finder?.id).then(({ store }) => {
										expect(select.value).to.equal(valueToSelect);
										expect(store.selections[index].selected).to.equal(valueToSelect);
										expect(store.storage.state[`ss-finder-${finder.id}`][finder.fields[0].field][`ss-${index}`].selected).to.equal(valueToSelect);
									});
								}
							});
					});
				});
			});

			it('can remove a previous selection', function () {
				if(!config.url) this.skip();

				if (!isHierarchy) this.skip();
				cy.snapController(finder?.id).then(({ store }) => {
					cy.get(finder.selector)
						.find('select')
						.then((select) => {
							const dropdownToClear = select[1] ? 1 : 0;
							select = select[dropdownToClear];
							const values = store.selections[dropdownToClear].data && store.selections[dropdownToClear].data.filter((option) => option.count > 1);
							const valueToSelect = values?.length && values[0]?.value;
							if(valueToSelect) {
								cy.get(select).select(valueToSelect, { force: true });
								cy.snapController(finder?.id).then(({ store }) => {
									expect(select.value).to.equal(valueToSelect);
									expect(store.selections[dropdownToClear].selected).to.equal(valueToSelect);
									expect(store.storage.state[`ss-finder-${finder.id}`][finder.fields[0].field][`ss-${dropdownToClear}`].selected).to.equal(
										valueToSelect
									);
								});
							}
						});
				});
			});

			it('can make all selections again', function () {
				if(!config.url) this.skip();

				if (!isHierarchy) this.skip();
				cy.snapController(finder?.id).then(({ store }) => {
					store.selections.map((selection, index) => {
						cy.get(finder.selector)
							.find('select')
							.then((select) => {
								if (!select.length > index) this.skip();

								select = select[index];
								const values = store.selections[index].data && store.selections[index].data.filter((option) => option.count > 1);
								const valueToSelect = values?.length && values[values.length - 1]?.value;
								if(valueToSelect){
									cy.get(select).select(valueToSelect, { force: true });
									cy.snapController(finder?.id).then(({ store }) => {
										expect(select.value).to.equal(valueToSelect);
										expect(store.selections[index].selected).to.equal(valueToSelect);
										expect(store.storage.state[`ss-finder-${finder.id}`][finder.fields[0].field][`ss-${index}`].selected).to.equal(valueToSelect);
									});
								}
							});
					});
				});
			});

			it('can click the find button', function () {
				if(!config.url) this.skip();

				if (!isHierarchy || !config.selectors?.finder?.findButton) this.skip();
				cy.snapController(finder?.id).then(({ store }) => {
					if (!store.selections) this.skip();

					cy.get(finder.selector).find(config.selectors.finder.findButton).should('exist').click({ force: true });
					cy.on('url:changed', (newUrl) => {
						const selection = store.selections.filter((selection) => selection.selected);
						const expectedUrl = selection.length && selection[0].services.urlManager.href;
						if(expectedUrl) {
							expect(newUrl).to.contain(expectedUrl);
						}
					});
				});
			});
		});

		describe('Tests non-Hierarchy', () => {
			it('has correct number of dropdowns', function () {
				if(!config.url) this.skip();

				if (isHierarchy) this.skip();
				cy.snapController(finder?.id).then(({ store }) => {
					cy.get(finder.selector).find('select').should('exist').should('have.length', store.selections.length);
				});
			});

			it('all select dropdowns are enabled', function () {
				if(!config.url) this.skip();

				if (isHierarchy) this.skip();
				cy.snapController(finder?.id).then(({ store }) => {
					cy.get(finder.selector)
						.find('select')
						.each((select, index) => {
							select = select[0];
							expect(select.disabled).to.equal(false);
						});
				});
			});

			it('can make all selections', function () {
				if(!config.url) this.skip();

				if (isHierarchy) this.skip();
				cy.snapController(finder?.id).then(({ store }) => {
					store.selections.forEach((_, index) => {
						cy.get(finder.selector)
							.find('select')
							.then((select) => {
								select = select[index];
								const values = store.selections[index].data && store.selections[index].data.filter((option) => option.count > 1);
								const valueToSelect = values?.length && values[values.length - 1]?.value;
								if (valueToSelect) {
									cy.get(select).select(`${valueToSelect}`, { force: true });
									cy.snapController(finder?.id).then(({ store }) => {
										expect(select.value).to.equal(`${valueToSelect}`);
										expect(store.selections[index].selected).to.equal(`${valueToSelect}`);
										expect(store.storage.state[`ss-finder-${finder.id}`][finder.fields[index].field].selected).to.equal(`${valueToSelect}`);
									});
								}
							});
					});
				});
			});

			it('can clear a selection', function () {
				if(!config.url) this.skip();

				if (isHierarchy) this.skip();
				cy.snapController(finder?.id).then(({ store }) => {
					cy.get(finder.selector)
						.find('select')
						.then((select) => {
							const dropdownToClear = 0; // first dropdown
							select = select[dropdownToClear];
							const valueToSelect = ''; // clear selection
							cy.get(select).select(valueToSelect, { force: true });
							cy.snapController(finder?.id).then(({ store }) => {
								expect(select.value).to.equal(`${valueToSelect}`);
								expect(store.selections[dropdownToClear].selected).to.equal(`${valueToSelect}`);
								expect(store.storage.state[`ss-finder-${finder.id}`][finder.fields[dropdownToClear].field].selected).to.equal(`${valueToSelect}`);
							});
						});
				});
			});

			it('can make all selections again', function () {
				if(!config.url) this.skip();

				if (isHierarchy) this.skip();
				cy.snapController(finder?.id).then(({ store }) => {
					store.selections.forEach((_, index) => {
						cy.get(finder.selector)
							.find('select')
							.then((select) => {
								select = select[index];
								const values = store.selections[index].data && store.selections[index].data.filter((option) => option.count > 1);
								const valueToSelect = values?.length && values[values.length - 1]?.value;
								if (valueToSelect) {
									cy.get(select).select(`${valueToSelect}`, { force: true });
									cy.snapController(finder?.id).then(({ store }) => {
										expect(store.selections[index].selected).to.equal(`${valueToSelect}`);
										expect(store.storage.state[`ss-finder-${finder.id}`][finder.fields[index].field].selected).to.equal(`${valueToSelect}`);
									});
								}
							});
					});
				});
			});

			it('can click the find button', function () {
				if(!config.url) this.skip();

				if (isHierarchy || !config.selectors?.finder?.findButton) this.skip();
				cy.snapController(finder?.id).then(({ store }) => {
					if (!store.selections) this.skip();

					cy.get(finder.selector).find(config.selectors.finder.findButton).should('exist').click({ force: true });
					cy.on('url:changed', (newUrl) => {
						const expectedUrl = store.selections.filter((selection) => selection.selected)[0].services.urlManager.href;
						expect(newUrl).to.contain(expectedUrl);
					});
				});
			});
		});
	});
});