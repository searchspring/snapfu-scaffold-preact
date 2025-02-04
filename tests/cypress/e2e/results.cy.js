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
	// pages to test (recommended: 1 search page, 1 category page)
	pages: [
		{ url: 'https://localhost:3333/index.html', id: 'Search' },
		// { url: 'https://try.searchspring.com/dresses', id: 'Category' },
	],
	disableGA: '', // disable google analytic events (example: 'UA-123456-1')
	selectors: {
		sidebar: {
			facetToggle: '', // button to open facet container
			facetWrapper: '.ss__facet', // facet wrapper
			facetTitle: '.ss__facet__header', // facet title, should contain facet.label innerText
			facetCollapseButton: '.ss__facet__header', // facet collapse button, should contain onClick to toggle collapse
			facetOpen: '.ss__dropdown--open', // facet open state class
			facetCollapsed: '', // facet closed state class
			facetOption: '.ss__facet__options a', // facet option, should be <a> element or element handling onClick
			showMoreButton: '.ss__facet__show-more-less', // facet show more button, should contain onClick
			searchWithinInput: '.ss__search-input__input', // facet search within, should be <input> element
			summaryWrapper: '.ss__filter-summary', // filter summary wrapper
			appliedFacetRemoveButton: 'a.ss__filter', // filter summary - a filter's remove button onClick and/or <a> element
			removeAllFacetsButton: '.ss__filter-summary__clear-all', // filter summary clear all button
		},
		sortBy: {
			native: 'select#ss__sort--select', // sort by <select> element (if applicable)
		},
		pagination: {
			infinite: false,
			loadMoreButton: '',
			prev: '.ss__pagination .ss__pagination__page--previous', // pagination previous
			page: '.ss__pagination .ss__pagination__page', // pagination page
			next: '.ss__pagination .ss__pagination__page--next', // pagination next
		},
		results: {
			productWrapper: '.ss__content .ss__result', // single result wrapper
		},
	},
};

config?.pages?.forEach((page, _i) => {
	describe(`${page.id || _i}`, () => {
		describe('Setup', () => {
			it('adds snap bundle to search page', function () {
				cy.visit(page.url);

				cy.addLocalSnap();

				cy.waitForBundle().then(() => {
					cy.window().then((window) => {
						expect(window.searchspring).to.exist;
					});
				});

				if (config.disableGA) {
					window[`ga-disable-${config.disableGA}`] = true;
				}

				cy.snapController().then(({ store }) => {
					expect(typeof store).to.equal('object');
				});
			});

			it('has data in the store', function () {
				cy.snapController().then(({ store }) => {
					expect(store).to.haveOwnProperty('pagination');
					expect(store.pagination.totalResults).to.be.greaterThan(0);
					expect(store.pagination.page).to.equal(1);
				});
			});
		});

		describe('Results Tests', () => {
			beforeEach('reset', function () {
				cy.snapController().then(({ store, urlManager }) => {
					// preserve initial query
					const query = urlManager.state.query;
					urlManager.set(query ? { query } : {}).go();

					cy.snapController().then(({ urlManager }) => {
						expect(urlManager).to.exist;
					});
				});
			});

			describe('Pagination', () => {
				it('loads next page when scrolled while using Infinite Scroll', function () {
					if (!config.selectors.pagination.infinite) this.skip();
					cy.snapController().then(({ store }) => {
						expect(store.pagination.page).to.equal(1);
						cy.get(config.selectors.results?.productWrapper).should('exist').should('have.length', store.pagination.pageSize);
					});

					if (config.selectors.pagination.loadMoreButton) {
						cy.get(config.selectors.pagination.loadMoreButton).should('exist').first().click({ force: true });
					} else {
						cy.window().scrollTo('bottom', { ensureScrollable: false });
					}

					cy.snapController().then(({ store }) => {
						expect(store.pagination.page).to.equal(2);
						cy.get(config.selectors.results?.productWrapper)
							.should('exist')
							.should('have.length', store.pagination.pageSize * 2);
					});

					if (config.selectors.pagination.loadMoreButton) {
						cy.get(config.selectors.pagination.loadMoreButton).should('exist').first().click({ force: true });
					} else {
						cy.window().scrollTo('bottom', { ensureScrollable: false });
					}

					cy.snapController().then(({ store }) => {
						expect(store.pagination.page).to.equal(3);
						cy.get(config.selectors.results?.productWrapper)
							.should('exist')
							.should('have.length', store.pagination.pageSize * 3);
						cy.window().scrollTo('top', { ensureScrollable: false });
					});
				});

				it('can navigate to the second page', function () {
					if (!config?.selectors?.pagination?.next && !config?.selectors?.pagination?.page) this.skip();

					if (config?.selectors?.pagination?.next) {
						cy.get(`${config.selectors.pagination.next}`)
							.first()
							.should('exist')
							.as('next')
							.invoke('attr', 'href')
							.then(function (href) {
								if (href) {
									cy.get('@next').click({ force: true });
								} else {
									cy.get('@next').find('a, button').click({ force: true });
								}
							})
							.then(function () {
								cy.snapController().then(({ store }) => {
									expect(store.pagination.page).to.equal(2);
								});
							});
					} else if (config?.selectors?.pagination?.page) {
						cy.get(config.selectors.pagination.page)
							.eq(1)
							.should('exist')
							.as('page2')
							.invoke('attr', 'href')
							.then(function (href) {
								if (href) {
									cy.get('@page2').click({ force: true });
								} else {
									cy.get('@page2').find('a, button').click({ force: true });
								}
							})
							.then(function () {
								cy.snapController().then(({ store }) => {
									expect(store.pagination.page).to.equal(2);
								});
							});
					}
				});

				it('can use prev page buttons', function () {
					if (!config?.selectors?.pagination?.prev && !config?.selectors?.pagination?.page) this.skip();

					// click page 2
					cy.get(config.selectors.pagination.page)
						.eq(1)
						.first()
						.should('exist')
						.as('page2')
						.invoke('attr', 'href')
						.then(function (href) {
							if (href) {
								cy.get('@page2').click({ force: true });
							} else {
								cy.get('@page2').find('a, button').click({ force: true });
							}
						})
						.then(function () {
							cy.snapController().then(({ store }) => {
								expect(store.pagination.page).to.equal(2);
							});
						});

					if (config?.selectors?.pagination?.prev) {
						cy.get(`${config.selectors.pagination.prev}`)
							.first()
							.should('exist')
							.as('prev')
							.invoke('attr', 'href')
							.then(function (href) {
								if (href) {
									cy.get('@prev').click({ force: true });
								} else {
									cy.get('@prev').find('a, button').click({ force: true });
								}
							})
							.then(function () {
								cy.snapController().then(({ store }) => {
									expect(store.pagination.page).to.equal(1);
								});
							});
					} else if (config?.selectors?.pagination?.page) {
						cy.get(config.selectors.pagination.page)
							.eq(0)
							.should('exist')
							.as('page1')
							.invoke('attr', 'href')
							.then(function (href) {
								if (href) {
									cy.get('@page1').click({ force: true });
								} else {
									cy.get('@page1').find('a, button').click({ force: true });
								}
							})
							.then(function () {
								cy.snapController().then(({ store }) => {
									expect(store.pagination.page).to.equal(1);
								});
							});
					}
				});

				it('can go to the third page', function () {
					if (!config?.selectors?.pagination?.page) this.skip();

					cy.get(config.selectors.pagination.page)
						.eq(2)
						.first()
						.should('exist')
						.as('page3')
						.invoke('attr', 'href')
						.then(function (href) {
							if (href) {
								cy.get('@page3').click({ force: true });
							} else {
								cy.get('@page3').find('a, button').click({ force: true });
							}
						})
						.then(function () {
							cy.snapController().then(({ store }) => {
								expect(store.pagination.page).to.equal(3);
							});
						});
				});
			});

			describe('Sort By', () => {
				it('Can sort by all options', function () {
					if (!config?.selectors?.sortBy?.native) this.skip();

					cy.window().scrollTo('top', { ensureScrollable: false });

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
								expect(store.sorting.current.field).to.equal(activeOption.field);
								expect(store.sorting.current.direction).to.equal(activeOption.direction);
							});
						});
				});
			});

			describe('Refinements', () => {
				it('has correct titles', function () {
					if (!config?.selectors?.sidebar?.facetTitle) this.skip();

					if (config?.selectors?.sidebar?.facetToggle) {
						cy.get(config?.selectors?.sidebar?.facetToggle).click({ force: true });
					}

					cy.snapController().then(({ store }) => {
						cy.get(config.selectors.sidebar.facetWrapper).each((el, index) => {
							const title = el.find(config.selectors.sidebar.facetTitle);
							expect(title.text().trim()).to.equal(store.facets[index].label.trim());
						});
					});
				});

				it('can toggle facet collapsed', function () {
					if (
						!config?.selectors?.sidebar?.facetWrapper ||
						(!config?.selectors?.sidebar?.facetCollapseButton &&
							(!config?.selectors?.sidebar?.facetOpen || !config?.selectors?.sidebar?.facetCollapsed))
					)
						this.skip();

					cy.snapController().then(({ store }) => {
						function checkCollapsed(elem) {
							let isCollapsed;
							if (config?.selectors?.sidebar?.facetOpen) {
								isCollapsed = !(elem[0].matches(config.selectors.sidebar.facetOpen) || elem.find(config.selectors.sidebar.facetOpen).length > 0);
							} else if (config?.selectors?.sidebar?.facetCollapsed) {
								isCollapsed =
									elem[0].matches(config.selectors.sidebar.facetCollapsed) || elem.find(config.selectors.sidebar.facetCollapsed).length > 0;
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
									cy.get(input).type(valueToType, {force: true});

									cy.snapController().then(({ store }) => {
										// expect visible values to be filtered
										const refinedOptions = store.facets[obj.index].refinedValues.filter((valueOption) =>
											valueOption.label.toLowerCase().includes(valueToType)
										);
										const visibleOptions = obj.el.find(config.selectors.sidebar.facetOption);
										expect(refinedOptions.length).to.equal(visibleOptions.length);
									});
								});
							});
					});
				});

				it('can select a list option', function () {
					if (!config?.selectors?.sidebar?.facetWrapper || !config?.selectors?.sidebar?.facetTitle || !config?.selectors?.sidebar?.facetOption)
						this.skip();

					cy.snapController().then(({ store }) => {
						// find first display='list' facet
						const listFacet = store.facets.filter((facet) => facet.display === 'list')[0];
						if (!listFacet) this.skip();

						cy.get(`${config.selectors.sidebar.facetWrapper}`).each((facet) => {
							// find matching facet in dom
							const title = facet.find(config.selectors.sidebar.facetTitle);
							if (listFacet.label.trim() === title.text().trim()) {
								if (listFacet.collapsed) {
									// toggle visibility if collapsed
									listFacet.toggleCollapse();
									cy.wait(1);
								}

								// click on an option in facet and ensure urlManager contains new state
								const facetListOption = facet.find(config.selectors.sidebar.facetOption)[0];
								const clickedHref = facetListOption.getAttribute('href');
								cy.get(facetListOption).click({ force: true });
								cy.snapController().then(({ store }) => {
									expect(Object.keys(store.services.urlManager.state.filter)).to.contain(listFacet.field);
									expect(clickedHref).to.equal(store.services.urlManager.href);
								});
							}
						});
					});
				});

				it('can select a slider option', function () {
					if (!config?.selectors?.sidebar?.facetWrapper || !config?.selectors?.sidebar?.facetTitle) this.skip();

					cy.snapController().then(({ store }) => {
						// find first display='slider' facet
						const sliderFacet = store.facets.filter((facet) => facet.display === 'slider')[0];
						if (!sliderFacet) this.skip();

						let facetSliderElement;
						cy.get(`${config.selectors.sidebar.facetWrapper}`)
							.each((facet) => {
								// find matching facet in dom
								const title = facet.find(config.selectors.sidebar.facetTitle);
								if (!facetSliderElement && sliderFacet.label.trim() === title.text().trim()) {
									facetSliderElement = facet;
									if (sliderFacet.collapsed) {
										// toggle visibility if collapsed
										sliderFacet.toggleCollapse();
										cy.wait(1);
									}
								}
							})
							.then(() => {
								// use left arrow to change slider values
								const leftHandle = cy.get(facetSliderElement.find('.ss__facet-slider__handles button')[0]);
								if (leftHandle) {
									leftHandle
										.should('have.attr', 'aria-valuenow', sliderFacet.active.low)
										.should('have.attr', 'aria-valuemin', sliderFacet.active.low)
										.should('have.attr', 'aria-valuemax', sliderFacet.active.high)
										.type('{rightarrow}', { force: true });

									cy.snapController().then(({ store }) => {
										// after re-render find the first display='slider' facet and DOM element again (since DOM references can be lost)
										const sliderFacet = store.facets.filter((facet) => facet.display === 'slider')[0];
										if (!sliderFacet) this.skip();

										let facetSliderElement;
										cy.get(`${config.selectors.sidebar.facetWrapper}`)
											.each((facet) => {
												// find matching facet in dom after re-render
												const title = facet.find(config.selectors.sidebar.facetTitle);
												if (!facetSliderElement && sliderFacet.label.trim() === title.text().trim()) {
													facetSliderElement = facet;
												}
											})
											.then(() => {
												const leftHandle = cy.get(facetSliderElement.find('.ss__facet-slider__handles button')[0]);
												if (leftHandle) {
													leftHandle
														.should('have.attr', 'aria-valuenow', sliderFacet.active.low)
														.should('have.attr', 'aria-valuemin', sliderFacet.active.low - sliderFacet.step)
														.should('have.attr', 'aria-valuemax', sliderFacet.active.high);
												}
											});
									});
								}
							});
					});
				});

				it('can remove applied filters individually', function () {
					if (!config?.selectors?.sidebar?.summaryWrapper || !config?.selectors?.sidebar?.appliedFacetRemoveButton) this.skip();
					cy.snapController().then(({ store }) => {
						// apply some filter
						let previousFilterLength;

						cy.get(`${config.selectors.sidebar.facetWrapper}`).each((facet, idx) => {
							if (idx == 0) {
								// click on an option in facet and ensure urlManager contains new state
								const facetListOption = facet.find(config.selectors.sidebar.facetOption)[0];
								cy.get(facetListOption).click({ force: true });
								cy.snapController().then(({ store }) => {
									expect(store.filters.length).to.greaterThan(0);
									previousFilterLength = store.filters.length;
								});
							}
						});

						// remove an applied filter
						cy.get(config.selectors.sidebar.summaryWrapper).find(config.selectors.sidebar.appliedFacetRemoveButton).first().click({ force: true });

						// expect one less filter to be applied
						cy.snapController().then(({ store }) => {
							expect(store.filters.length).to.equal(previousFilterLength - 1);
						});
					});
				});

				it('can select a grid option', function () {
					if (!config?.selectors?.sidebar?.facetWrapper || !config?.selectors?.sidebar?.facetTitle || !config?.selectors?.sidebar?.facetOption)
						this.skip();

					cy.snapController().then(({ store }) => {
						// find first display='grid' facet
						const gridFacet = store.facets.filter((facet) => facet.display === 'grid')[0];
						if (!gridFacet) this.skip();

						let facetGridElement;
						cy.get(`${config.selectors.sidebar.facetWrapper}`)
							.each((facet) => {
								// find matching facet in dom
								const title = facet.find(config.selectors.sidebar.facetTitle);
								if (!facetGridElement && gridFacet.label.trim() === title.text().trim()) {
									facetGridElement = facet;
									if (gridFacet.collapsed) {
										// toggle visibility if collapsed
										gridFacet.toggleCollapse();
										cy.wait(1);
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
					if (!config?.selectors?.sidebar?.facetWrapper || !config?.selectors?.sidebar?.facetTitle || !config?.selectors?.sidebar?.facetOption)
						this.skip();

					cy.snapController().then(({ store }) => {
						// find first display='palette' facet
						const paletteFacet = store.facets.filter((facet) => facet.display === 'palette')[0];
						if (!paletteFacet) this.skip();

						let facetPaletteElement;
						cy.get(`${config.selectors.sidebar.facetWrapper}`)
							.each((facet) => {
								// find matching facet in dom
								const title = facet.find(config.selectors.sidebar.facetTitle);
								if (!facetPaletteElement && paletteFacet.label.trim() === title.text().trim()) {
									facetPaletteElement = facet;
									if (paletteFacet.collapsed) {
										// toggle visibility if collapsed
										paletteFacet.toggleCollapse();
										cy.wait(1);
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
					if (!config?.selectors?.sidebar?.facetWrapper || !config?.selectors?.sidebar?.facetTitle || !config?.selectors?.sidebar?.facetOption)
						this.skip();

					cy.snapController().then(({ store }) => {
						// find first display='hierarchy' facet
						const hierarchyFacet = store.facets.filter((facet) => facet.display === 'hierarchy')[0];
						if (!hierarchyFacet) this.skip();

						let facetHierarchyElement;
						cy.get(`${config.selectors.sidebar.facetWrapper}`)
							.each((facet) => {
								// find matching facet in dom
								const title = facet.find(config.selectors.sidebar.facetTitle);
								if (!facetHierarchyElement && hierarchyFacet.label.trim() === title.text().trim()) {
									facetHierarchyElement = facet;
									if (hierarchyFacet.collapsed) {
										// toggle visibility if collapsed
										hierarchyFacet.toggleCollapse();
										cy.wait(1);
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
						if (!config?.selectors?.sidebar?.facetWrapper || !config?.selectors?.sidebar?.facetTitle || !config?.selectors?.sidebar?.facetOption) {
							this.skip();
						} else {
							cy.get(`${config.selectors.sidebar.facetWrapper}`)
								.each((facet, idx) => {
									if (idx == 0) {
										// click on an option in facet and ensure urlManager contains new state
										const facetListOption = facet.find(config.selectors.sidebar.facetOption)[0];
										if (facetListOption) {
											cy.get(facetListOption).click({ force: true });
										}
									}
								})
								.then(function () {
									cy.snapController().then(({ store }) => {
										expect(store.filters.length).to.equal(1);
									});
								});
						}
					});

					cy.get(config?.selectors?.sidebar?.removeAllFacetsButton)
						.first()
						.should('exist')
						.click({ force: true })
						.then(function () {
							cy.snapController().then(({ store }) => {
								expect(store.filters.length).to.equal(0);
							});
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

			if (_i === 0) {
				// only take screenshot once
				describe('Snapshot', () => {
					it('saves a screenshot', function () {
						cy.window().scrollTo('topLeft', { ensureScrollable: false });
						cy.screenshot('snapshot', { capture: 'viewport' });
					});
				});
			}
		});
	});
});
