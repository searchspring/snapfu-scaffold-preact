const config = {
	pages: [
		{ url: 'https://localhost:3333/index.html', id: 'Search' },
		// { url: 'https://try.searchspring.com/dresses', id: 'Category' },
	],
	disableGA: '',
	selectors: {
		sidebar: {
			facetWrapper: '.ss__facet',
			facetTitle: '.ss__facet__header',
			facetCollapseButton: '.ss__dropdown__button',
			facetOpen: '.ss__dropdown--open',
			facetCollapsed: '',
			facetOption: '.ss__facet__options a',
			showMoreButton: 'ss__facet__show-more-less',
			searchWithinInput: '',
			summaryWrapper: '.ss__filter-summary',
			appliedFacetRemoveButton: '.ss__filter',
			removeAllFacetsButton: '.ss__filter-summary__clear-all',
		},
		sortBy: {
			native: 'select#SortBy',
		},
		pagination: {
			prev: '.ss__pagination .ss__pagination__prev',
			page: '.ss__pagination .ss__pagination__page',
			next: '.ss__pagination .ss__pagination__next',
		},
		results: {
			productWrapper: '.ss__contents .grid__item',
		},
	},
};

config?.pages?.forEach((page, _i) => {
	describe(`${page.id || _i}`, () => {
		describe('Setup', () => {
			it('adds snap bundle to search page', () => {
				cy.on('uncaught:exception', (err, runnable) => false);
				cy.visit(page.url);
				
				cy.addLocalSnap();

				if (config.disableGA) {
					window[`ga-disable-${config.disableGA}`] = true;
				}

				cy.wait('@meta').should('exist');
				cy.wait('@search').should('exist');

				cy.snapController().then(({ store }) => {
					expect(typeof store).to.equal('object');
				});
			});

			it('has data in the store', () => {
				cy.snapController().then(({ store }) => {
					expect(store).to.haveOwnProperty('pagination');
					expect(store.pagination.totalResults).to.be.greaterThan(0);
					expect(store.pagination.page).to.equal(1);
				});
			});
		});

		describe('Pagination', () => {
			it('can navigate to the second page', function () {
				if (!config?.selectors?.pagination?.next && !config?.selectors?.pagination?.page) this.skip();

				if (config?.selectors?.pagination?.next) {
					cy.get(`${config.selectors.pagination.next}`).first().should('exist').as('next').invoke('attr', 'href').then(function(href) {
						if (href) {
							cy.get('@next').click({ force: true });
						} else {
							cy.get('@next').find('a').click({ force: true });
						}
					});
				} else if (config?.selectors?.pagination?.page) {
					cy.get(config.selectors.pagination.page).eq(1).should('exist').as('page2').invoke('attr', 'href').then(function(href) {
						if (href) {
							cy.get('@page2').click({ force: true });
						} else {
							cy.get('@page2').find('a').click({ force: true });
						}
					});
				}

				cy.snapController().then(({ store }) => {
					expect(store.pagination.page).to.equal(2);
				});
			});

			it('can go back to the first page', function () {
				if (!config?.selectors?.pagination?.prev && !config?.selectors?.pagination?.page) this.skip();

				if (config?.selectors?.pagination?.prev) {
					cy.get(`${config.selectors.pagination.prev}`).first().should('exist').as('prev').invoke('attr', 'href').then(function(href) {
						if (href) {
							cy.get('@prev').click({ force: true });
						} else {
							cy.get('@prev').find('a').click({ force: true });
						}
					});
				} else if (config?.selectors?.pagination?.page) {
					cy.get(config.selectors.pagination.page).eq(0).should('exist').as('page1').invoke('attr', 'href').then(function(href) {
						if (href) {
							cy.get('@page1').click({ force: true });
						} else {
							cy.get('@page1').find('a').click({ force: true });
						}
					});
				}

				cy.snapController().then(({ store }) => {
					expect(store.pagination.page).to.equal(1);
				});
			});

			it('can go to the third page', function () {
				if (!config?.selectors?.pagination?.page) this.skip();

				cy.get(config.selectors.pagination.page).eq(2).first().should('exist').as('page3').invoke('attr', 'href').then(function(href) {
					if (href) {
						cy.get('@page3').click({ force: true });
					} else {
						cy.get('@page3').find('a').click({ force: true });
					}
				});

				cy.snapController().then(({ store }) => {
					expect(store.pagination.page).to.equal(3);
				});
			});
		});

		describe('Sort By', () => {
			it('Can sort by all options', function () {
				if (!config?.selectors?.sortBy?.native) this.skip();

				cy.get(config.selectors.sortBy?.native)
					.should('exist')
					.find('> option')
					.each((el, index) => {
						const optionIndexToSelect = index;
						cy.get(config.selectors.sortBy?.native)
							.find('> option')
							.should('have.length.gt', optionIndexToSelect)
							.eq(optionIndexToSelect)
							.then((element) => {
								cy.get(config.selectors.sortBy?.native).select(element.val(), { force: true });
							});
						cy.snapController().then(({ store }) => {
							const activeOption = store.sorting.options[optionIndexToSelect];
							expect(activeOption.active).to.equal(true);
							expect(store.sorting.current).to.equal(activeOption);
						});
					});
			});
		});

		describe('Refinements', () => {
			it('has correct titles', function () {
				if (!config?.selectors?.sidebar?.facetTitle) this.skip();

				cy.snapController().then(({ store }) => {
					cy.get(config.selectors.sidebar.facetTitle)
						.should('have.length', store.facets.length)
						.each((el, index) => {
							const title = el.text().trim();
							expect(title).to.equal(store.facets[index].label.trim());
						});
				});
			});

			it('can toggle facet collapsed', function () {
				if (
					!config?.selectors?.sidebar?.facetWrapper &&
					!config?.selectors?.sidebar?.facetCollapseButton &&
					(!config?.selectors?.sidebar?.facetOpen ||
					!config?.selectors?.sidebar?.facetCollapsed)
				)
					this.skip();

				cy.snapController().then(({ store }) => {
					function checkCollapsed(elem) {
						let isCollapsed;
						if (config?.selectors?.sidebar?.facetOpen) {
							isCollapsed = !(elem[0].matches(config.selectors.sidebar.facetOpen) ||
							elem.find(config.selectors.sidebar.facetOpen).length > 0);
						} else if (config?.selectors?.sidebar?.facetCollapsed) {
							isCollapsed = elem[0].matches(config.selectors.sidebar.facetCollapsed) ||
							elem.find(config.selectors.sidebar.facetCollapsed).length > 0;
						}

						return isCollapsed;
					}

					cy.get(config.selectors.sidebar.facetWrapper).each((el, index) => {
						// for each facet, expect the facet collapsed state to be correct
						expect(store.facets[index].collapsed).to.equal(checkCollapsed(el));
						// click on the facet collapsed button to toggle collapsed
						cy.get(el.find(config.selectors.sidebar.facetCollapseButton)).click({ force: true });
						cy.snapController().then(({ store }) => {
							// check to see if collapsed state was toggled in store
							expect(store.facets[index].collapsed).to.equal(checkCollapsed(el));
						});
					});
				});
			});

			it('can toggle facet overflow', function () {
				if (!config?.selectors?.sidebar?.facetWrapper && !config?.selectors?.sidebar?.showMoreButton && !config?.selectors?.sidebar?.facetOption)
					this.skip();

				cy.snapController().then(({ store }) => {
					const overflowFacets = store.facets.filter((facet) => facet.overflow?.enabled);
					const facetElementsWithOverflow = [];

					cy.get(`${config.selectors.sidebar.facetWrapper}`)
						.each((el, index) => {
							// find facet elements that have overflow
							if (el.find(config.selectors.sidebar.showMoreButton).length) {
								facetElementsWithOverflow.push(el);
							}
						})
						.then(() => {
							// ensure facet is not collapsed
							facetElementsWithOverflow.forEach((overflowingFacet, index) => {
								if (overflowFacets[index].collapsed) {
									// toggle visibility if collapsed
									cy.get(overflowingFacet.find(config.selectors.sidebar.facetCollapseButton)).click({ force: true });
								}
							});
						})
						.then(() => {
							// ensure visible facet options is limited
							facetElementsWithOverflow.forEach((overflowingFacet, index) => {
								const visibleOptions = overflowingFacet.find(config.selectors.sidebar.facetOption);
								expect(visibleOptions.length).to.equal(overflowFacets[index].overflow.limit);
							});
						})
						.then(() => {
							// click on the 'show more' buttons to expand
							facetElementsWithOverflow.forEach((overflowingFacet, index) => {
								cy.get(overflowingFacet.find(config.selectors.sidebar.showMoreButton)).click({ force: true });
							});
						})
						.then(() => {
							// ensure all facet options are visible
							facetElementsWithOverflow.forEach((overflowingFacet, index) => {
								const visibleOptions = overflowingFacet.find(config.selectors.sidebar.facetOption);
								expect(visibleOptions.length).to.equal(overflowFacets[index].values.length);
							});
						});
				});
			});

			it('can search options within facet', function () {
				if (!config?.selectors?.sidebar?.facetWrapper || !config?.selectors?.sidebar?.searchWithinInput || !config?.selectors?.sidebar?.facetOption)
					this.skip();

				cy.snapController().then(({ store }) => {
					const facetElementsWithInputs = [];
					cy.get(`${config.selectors.sidebar.facetWrapper}`)
						.each((el, index) => {
							// find facet elements that have search within input
							if (el.find(config.selectors.sidebar.searchWithinInput).length) {
								facetElementsWithInputs.push({ index, el });
							}
						})
						.then(() => {
							facetElementsWithInputs.forEach((obj) => {
								// type in the first two characters of the first value
								const valueToType = store.facets[obj.index].values[0].label.substring(0, 2).toLowerCase();
								const input = obj.el.find(config.selectors.sidebar.searchWithinInput)[0];
								cy.get(input).type(valueToType);

								cy.snapController().then(({ store }) => {
									// expect visible values to be filtered
									const refinedOptions = store.facets[obj.index].refinedValues.filter((valueOption) => valueOption.value.toLowerCase().includes(valueToType));
									const visibleOptions = obj.el.find(config.selectors.sidebar.facetOption);
									expect(refinedOptions.length).to.equal(visibleOptions.length);
								});
							});
						});
				});
			});

			it('can select a slider option', function () {
				if (!config?.selectors?.sidebar?.facetWrapper || !config?.selectors?.sidebar?.facetTitle)
					this.skip();

				cy.snapController().then(({ store }) => {
					// find first display='slider' facet
					const sliderFacet = store.facets.filter((facet) => facet.display === 'slider')[0];
					if (!sliderFacet) this.skip();

					let facetSliderElement;
					cy.get(`${config.selectors.sidebar.facetWrapper}`).each((facet) => {
						// find matching facet in dom
						const title = facet.find(config.selectors.sidebar.facetTitle);
						if (!facetSliderElement && sliderFacet.label.trim() === title.text().trim()) {
							facetSliderElement = facet;
							if (sliderFacet.collapsed) {
								// toggle visibility if collapsed
								sliderFacet.toggleCollapse();
							}
						}
					})
					.then(() => {
						// use left arrow to change slider values
						const leftHandle = cy.get(facetSliderElement.find('.ss__facet-slider__handles button')[0]);
						if (leftHandle) {
							leftHandle.should('have.attr', 'aria-valuenow', sliderFacet.active.low)
							.should('have.attr', 'aria-valuemin', sliderFacet.active.low)
							.should('have.attr', 'aria-valuemax', sliderFacet.active.high)
							.type('{rightarrow}', { force: true })

							cy.snapController().then(({ store }) => {
								cy.get(facetSliderElement.find('.ss__facet-slider__handles button')[0])
									.should('have.attr', 'aria-valuenow', sliderFacet.active.low + sliderFacet.step)
									.should('have.attr', 'aria-valuemin', sliderFacet.active.low)
									.should('have.attr', 'aria-valuemax', sliderFacet.active.high);
							});
						}
					});
				});
			});

			it.skip('can select a list option', function () {
				if (
					!config?.selectors?.sidebar?.facetWrapper ||
					!config?.selectors?.sidebar?.facetTitle ||
					!config?.selectors?.sidebar?.facetOption
				)
					this.skip();

				cy.snapController().then(({ store }) => {
					// find first display='list' facet
					const listFacet = store.facets.filter((facet) => facet.display === 'list')[0];
					if (!listFacet) this.skip();

					let facetListElement;
					cy.get(`${config.selectors.sidebar.facetWrapper}`).each((facet) => {
						// find matching facet in dom
						const title = facet.find(config.selectors.sidebar.facetTitle);
						if (!facetListElement && listFacet.label.trim() === title.text().trim()) {
							facetListElement = facet;
							if (listFacet.collapsed) {
								// toggle visibility if collapsed
								listFacet.toggleCollapse();
							}
						}
					})
					.then(() => {
						// click on an option in facet and ensure urlManager contains new state
						const facetListOption = facetListElement.find(config.selectors.sidebar.facetOption)[0];
						const clickedValue = facetListOption.innerText;
						cy.get(facetListOption).click({ force: true });
						cy.snapController().then(({ store }) => {
							expect(Object.keys(store.services.urlManager.state.filter)).to.contain(listFacet.field);
							const value = store.services.urlManager.state.filter[listFacet.field][0];
							expect(clickedValue).to.contain(value);
						});
					});
				});
			});

			it('can remove applied filters individually', function () {
				if (!config?.selectors?.sidebar?.summaryWrapper || !config?.selectors?.sidebar?.appliedFacetRemoveButton) this.skip();
				cy.snapController().then(({ store }) => {
					// ensure that a filter has been applied from above it()
					expect(store.filters.length).to.greaterThan(0);

					// expect some filters applied
					let previousFilterLength;
					cy.snapController().then(({ store }) => {
						expect(store.filters.length).to.be.greaterThan(0);
						previousFilterLength = store.filters.length;
					});

					// remove an applied filter
					cy.get(config.selectors.sidebar.summaryWrapper)
						.find(config.selectors.sidebar.appliedFacetRemoveButton)
						.first().click({ force: true });

					// expect one less filter to be applied
					cy.snapController().then(({ store }) => {
						expect(store.filters.length).to.equal(previousFilterLength - 1);
					});
				});
			});

			it('can select a grid option', function () {
				if (
					!config?.selectors?.sidebar?.facetWrapper ||
					!config?.selectors?.sidebar?.facetTitle ||
					!config?.selectors?.sidebar?.facetOption
				)
					this.skip();

				cy.snapController().then(({ store }) => {
					// find first display='grid' facet
					const gridFacet = store.facets.filter((facet) => facet.display === 'grid')[0];
					if (!gridFacet) this.skip();

					let facetGridElement;
					cy.get(`${config.selectors.sidebar.facetWrapper}`).each((facet) => {
						// find matching facet in dom
						const title = facet.find(config.selectors.sidebar.facetTitle);
						if (!facetGridElement && gridFacet.label.trim() === title.text().trim()) {
							facetGridElement = facet;
							if (gridFacet.collapsed) {
								// toggle visibility if collapsed
								gridFacet.toggleCollapse();
							}
						}
					})
					.then(() => {
						// click on an option in facet and ensure urlManager contains new state
						const facetGridOption = facetGridElement.find(config.selectors.sidebar.facetOption)[0];
						const clickedValue = facetGridOption.innerText;
						cy.get(facetGridOption).click({ force: true });
						cy.snapController().then(({ store }) => {
							expect(Object.keys(store.services.urlManager.state.filter)).to.contain(gridFacet.field);
							const value = store.services.urlManager.state.filter[gridFacet.field][0];
							expect(clickedValue).to.contain(value);
						});
					});
				});
			});

			it('can select a palette option', function () {
				if (
					!config?.selectors?.sidebar?.facetWrapper ||
					!config?.selectors?.sidebar?.facetTitle ||
					!config?.selectors?.sidebar?.facetOption
				)
					this.skip();

				cy.snapController().then(({ store }) => {
					// find first display='palette' facet
					const paletteFacet = store.facets.filter((facet) => facet.display === 'palette')[0];
					if (!paletteFacet) this.skip();

					let facetPaletteElement;
					cy.get(`${config.selectors.sidebar.facetWrapper}`).each((facet) => {
						// find matching facet in dom
						const title = facet.find(config.selectors.sidebar.facetTitle);
						if (!facetPaletteElement && paletteFacet.label.trim() === title.text().trim()) {
							facetPaletteElement = facet;
							if (paletteFacet.collapsed) {
								// toggle visibility if collapsed
								paletteFacet.toggleCollapse();
							}
						}
					})
					.then(() => {
						// click on an option in facet and ensure urlManager contains new state
						const facetPaletteOption = facetPaletteElement.find(config.selectors.sidebar.facetOption)[0];
						const clickedValue = facetPaletteOption.innerText;
						cy.get(facetPaletteOption).click({ force: true });
						cy.snapController().then(({ store }) => {
							expect(Object.keys(store.services.urlManager.state.filter)).to.contain(paletteFacet.field);
							const value = store.services.urlManager.state.filter[paletteFacet.field][0];
							expect(clickedValue).to.contain(value);
						});
					});
				});
			});

			it('can select a hierarchy option', function () {
				if (
					!config?.selectors?.sidebar?.facetWrapper ||
					!config?.selectors?.sidebar?.facetTitle ||
					!config?.selectors?.sidebar?.facetOption
				)
					this.skip();

				cy.snapController().then(({ store }) => {
					// find first display='hierarchy' facet
					const hierarchyFacet = store.facets.filter((facet) => facet.display === 'hierarchy')[0];
					if (!hierarchyFacet) this.skip();

					let facetHierarchyElement;
					cy.get(`${config.selectors.sidebar.facetWrapper}`).each((facet) => {
						// find matching facet in dom
						const title = facet.find(config.selectors.sidebar.facetTitle);
						if (!facetHierarchyElement && hierarchyFacet.label.trim() === title.text().trim()) {
							facetHierarchyElement = facet;
							if (hierarchyFacet.collapsed) {
								// toggle visibility if collapsed
								hierarchyFacet.toggleCollapse();
							}
						}
					})
					.then(() => {
						// click on an option in facet and ensure urlManager contains new state
						const facetHierarchyOption = facetHierarchyElement.find(config.selectors.sidebar.facetOption)[0];
						const clickedValue = facetHierarchyOption.innerText.split('(')[0].trim();
						cy.get(facetHierarchyOption).click({ force: true });
						cy.snapController().then(({ store }) => {
							expect(Object.keys(store.services.urlManager.state.filter)).to.contain(hierarchyFacet.field);
							const value = store.services.urlManager.state.filter[hierarchyFacet.field][0].split(hierarchyFacet.hierarchyDelimiter).pop();
							expect(clickedValue).to.contain(value);
						});
					});
				});
			});

			it('can clear all facets', function () {
				if (!config?.selectors?.sidebar?.removeAllFacetsButton) this.skip();

				cy.snapController().then(({ store }) => {
					if (store.filters.length === 0) this.skip();
				});
				cy.get(config?.selectors?.sidebar?.removeAllFacetsButton).should('exist').click({ force: true });
				cy.snapController().then(({ store }) => {
					expect(store.filters.length).to.equal(0);
				});
			});
		});

		describe('Results', () => {
			it('has correct product count per page', function () {
				if (!config?.selectors?.results?.productWrapper) this.skip();

				cy.snapController().then(({ store }) => {
					cy.get(config.selectors.results?.productWrapper).should('exist').should('have.length', store.pagination.pageSize);
				});
			});
		});

		if (_i === 0) { // only take screenshot once
			describe('Snapshot', () => {
				it('saves a screenshot', function () {
					cy.visit(page.url);
					cy.waitForIdle().then(() => {
						cy.screenshot('snapshot', { capture: 'viewport' });
					});
				});
			});
		}
	});
});