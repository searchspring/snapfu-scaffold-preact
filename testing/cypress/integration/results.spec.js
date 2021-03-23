const config = {
	pages: [
		{ url: '', id: 'Search' },
		// { url: 'https://try.searchspring.com/dresses', id: 'Category' },
	],
	disableGA: '',
	selectors: {
		sidebar: {
			facetWrapper: '.ss-facet-container',
			facetTitle: '.accordion-title',
			facetCollapseButton: '.accordion-navigation-actions',
			facetOpenClass: '.is-open',
			facetOption: 'li.navList-item a',
			showMoreButton: '.ss-show-more-link',
			searchWithinInput: 'input[type=text].ss-search-options-field',
			summaryWrapper: '.ss-summary.facetedSearch-refineFilters',
			appliedFacetRemoveButton: 'ul.inlineList.inlineList--labels li a',
			removeAllFacetsButton: '.ss-summary-reset a',
		},
		sortBy: {
			native: 'select#sort',
		},
		pagination: {
			first: '',
			prev: 'li.pagination-item.pagination-item--previous a',
			page: (num) => `li.pagination-item:not(.pagination-item--next, .pagination-item--previous )${num ? `:nth-child(${num})` : ``} a`,
			next: 'li.pagination-item.pagination-item--next a',
			last: '',
			current: 'li.pagination-item.pagination-item--current a',
		},
		results: {
			productWrapper: 'li.product',
		},
	},
};

config?.pages?.forEach((page, _i) => {
	describe(`${page.id || _i}`, () => {
		describe('Setup', () => {
			it('adds snap bundle to search page', () => {
				cy.on('uncaught:exception', (err, runnable) => false);
				cy.visit(page.url);
				cy.addLocalSnap(); // as @script

				if (config.disableGA) {
					window[`ga-disable-${config.disableGA}`] = true;
				}

				cy.wait('@script').should((script) => {
					expect(script.state).to.equal('Complete');
				});

				cy.wait('@meta').should('exist');
				cy.wait('@search').should('exist');

				cy.snapStore().then((store) => {
					expect(typeof store).to.equal('object');
				});
			});

			it('injects into main containers', () => {
				cy.get('#searchspring-sidebar').should('exist');
				cy.get('#searchspring-content').should('exist');
			});

			it('has data in the store', () => {
				cy.snapStore().then((store) => {
					expect(store).to.haveOwnProperty('pagination');
					expect(store.pagination.totalResults).to.be.greaterThan(0);
					expect(store.pagination.page).to.equal(1);
				});
			});
		});

		describe('Pagination', () => {
			it('can navigate to the second page', function () {
				if (!config?.selectors?.pagination?.prev && !config?.selectors?.pagination?.next) this.skip();

				cy.get(`${config.selectors.pagination.prev}:first`).should('not.exist');
				cy.get(`${config.selectors.pagination.next}:first`).should('exist').click();

				cy.snapStore().then((store) => {
					expect(store.pagination.page).to.equal(2);
				});
			});

			it('can go back to the first page', function () {
				if (!config?.selectors?.pagination?.prev && !config?.selectors?.pagination?.next) this.skip(); // next included here because previous test depends on it

				cy.get(`${config.selectors.pagination.prev}:first`).should('exist').click();

				cy.snapStore().then((store) => {
					expect(store.pagination.page).to.equal(1);
				});
			});

			it('can go to the third page', function () {
				if (!config?.selectors?.pagination?.page() || !config?.selectors?.pagination?.page) this.skip();

				cy.get(`${config.selectors.pagination.page(3)}:first`)
					.should('exist')
					.click();

				cy.snapStore().then((store) => {
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
								cy.get(config.selectors.sortBy?.native).select(element.val());
							});
						cy.snapStore().then((store) => {
							const activeOption = store.sorting.options[optionIndexToSelect];
							expect(activeOption.active).to.equal(true);
							expect(store.sorting.current).to.equal(activeOption);
						});
					});
			});

			it('Goes back to page 1', function () {
				if (!config?.selectors?.sortBy?.native) this.skip();

				cy.get('[data-snap-page="prev"]:first').should('not.exist');
				cy.get('[data-snap-page="next"]:first').should('exist').click();
				cy.snapStore().then((store) => {
					expect(store.pagination.page).to.equal(2);
				});
				cy.get(config.selectors.sortBy?.native)
					.find('> option')
					.should('have.length.gt', 1)
					.eq(1)
					.then((element) => {
						cy.get(config.selectors.sortBy?.native).select(element.val());
					});
				cy.snapStore().then((store) => {
					expect(store.pagination.page).to.equal(1);
				});
			});
		});

		describe('Refinements', () => {
			it('has correct titles', function () {
				if (!config?.selectors?.sidebar?.facetTitle) this.skip();

				cy.snapStore().then((store) => {
					cy.get(config.selectors.sidebar.facetTitle)
						.should('have.length', store.facets.length)
						.each((el, index) => {
							const title = el.text();
							expect(title).to.equal(store.facets[index].label);
						});
				});
			});

			it('can toggle facet collapse', function () {
				if (
					!config?.selectors?.sidebar?.facetWrapper &&
					!config?.selectors?.sidebar?.facetOpenClass &&
					!config?.selectors?.sidebar?.facetCollapseButton
				)
					this.skip();

				cy.snapStore().then((store) => {
					cy.get(config.selectors.sidebar.facetWrapper).each((el, index) => {
						// for each facet, expect the facet collapse state to be correct
						let isCollapsed = !el.find(config.selectors.sidebar.facetOpenClass).length > 0;
						expect(store.facets[index].collapse).to.equal(isCollapsed);
						// click on the facet collapse button to toggle collapse
						cy.get(el.find(config.selectors.sidebar.facetCollapseButton)).click();
						cy.snapStore().then((store) => {
							// check to see if collapse state was toggled in store
							isCollapsed = !el.find(config.selectors.sidebar.facetOpenClass).length > 0;
							expect(store.facets[index].collapse).to.equal(isCollapsed);
						});
					});
				});
			});

			it('can toggle facet overflow', function () {
				if (!config?.selectors?.sidebar?.facetWrapper && !config?.selectors?.sidebar?.showMoreButton && !config?.selectors?.sidebar?.facetOption)
					this.skip();

				cy.snapStore().then((store) => {
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
								if (overflowFacets[index].collapse) {
									// toggle visibility if collapsed
									cy.get(overflowingFacet.find(config.selectors.sidebar.facetCollapseButton)).click();
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
								cy.get(overflowingFacet.find(config.selectors.sidebar.showMoreButton)).click();
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
				if (!config?.selectors?.sidebar?.facetWrapper && !config?.selectors?.sidebar?.searchWithinInput && !config?.selectors?.sidebar?.facetOption)
					this.skip();

				cy.snapStore().then((store) => {
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
								const valueToType = store.facets[obj.index].values[0].label.substring(0, 2);
								const input = obj.el.find(config.selectors.sidebar.searchWithinInput)[0];
								cy.get(input).type(valueToType);

								cy.snapStore().then((store) => {
									// expect visible values to be filtered
									const refinedOptions = store.facets[obj.index].refinedValues.filter((valueOption) => valueOption.value.includes(valueToType));
									const visibleOptions = obj.el.find(config.selectors.sidebar.facetOption);
									expect(refinedOptions.length).to.equal(visibleOptions.length);
								});
							});
						});
				});
			});

			it('can select a list option', function () {
				if (
					!config?.selectors?.sidebar?.facetWrapper &&
					!config?.selectors?.sidebar?.facetTitle &&
					!config?.selectors?.sidebar?.facetCollapseButton &&
					!config?.selectors?.sidebar?.facetOption
				)
					this.skip();

				cy.snapStore().then((store) => {
					// find first display='list' facet
					const listFacet = store.facets.filter((facet) => facet.display === 'list')[0];

					let facetListElement = null;
					listFacet &&
						cy
							.get(`${config.selectors.sidebar.facetWrapper}`)
							.each((facet, index) => {
								// find matching facet in dom
								const title = facet.find(config.selectors.sidebar.facetTitle);
								if (!facetListElement && listFacet.label === title.text()) {
									facetListElement = facet;
									if (listFacet.collapse) {
										// toggle visibility if collapsed
										cy.get(facet.find(config.selectors.sidebar.facetCollapseButton)).click();
									}
								}
							})
							.then(() => {
								// click on an option in facet and ensure urlManager contains new state
								const facetListOption = facetListElement.find(config.selectors.sidebar.facetOption)[0];
								const clickedValue = facetListOption.innerText;
								cy.get(facetListOption).click();
								cy.snapStore().then((store) => {
									expect(Object.keys(store.controller.urlManager.state.filter)).to.contain(listFacet.field);
									const value = store.controller.urlManager.state.filter[listFacet.field][0];
									expect(clickedValue).to.contain(value);
								});
							});
				});
			});

			it('can remove applied filters individually', function () {
				if (!config?.selectors?.sidebar?.summaryWrapper && !config?.selectors?.sidebar?.appliedFacetRemoveButton) this.skip();
				cy.snapStore().then((store) => {
					// ensure that a filter has been applied from above it()
					expect(store.filters.length).to.greaterThan(0);

					// remove all applied filters
					cy.get(config.selectors.sidebar.summaryWrapper)
						.find(config.selectors.sidebar.appliedFacetRemoveButton)
						.each((filter) => {
							filter[0].click();
						});
					// expect no filters applied
					cy.snapStore().then((store) => {
						expect(store.filters.length).to.equal(0);
					});
				});
			});

			it('can select a grid option', function () {
				if (
					!config?.selectors?.sidebar?.facetWrapper &&
					!config?.selectors?.sidebar?.facetTitle &&
					!config?.selectors?.sidebar?.facetCollapseButton &&
					!config?.selectors?.sidebar?.facetOption
				)
					this.skip();

				cy.snapStore().then((store) => {
					// find first display='grid' facet
					const gridFacet = store.facets.filter((facet) => facet.display === 'grid')[0];
					let facetGridElement = null;
					gridFacet &&
						cy
							.get(`${config.selectors.sidebar.facetWrapper}`)
							.each((facet, index) => {
								// find matching facet in dom
								const title = facet.find(config.selectors.sidebar.facetTitle);
								if (!facetGridElement && gridFacet.label === title.text()) {
									facetGridElement = facet;
									if (gridFacet.collapse) {
										// toggle visibility if collapsed
										cy.get(facet.find(config.selectors.sidebar.facetCollapseButton)).click();
									}
								}
							})
							.then(() => {
								// click on an option in facet and ensure urlManager contains new state
								const facetGridOption = facetGridElement.find(config.selectors.sidebar.facetOption)[0];
								const clickedValue = facetGridOption.innerText;
								cy.get(facetGridOption).click();
								cy.snapStore().then((store) => {
									expect(Object.keys(store.controller.urlManager.state.filter)).to.contain(gridFacet.field);
									const value = store.controller.urlManager.state.filter[gridFacet.field][0];
									expect(clickedValue).to.contain(value);
								});
							});
				});
			});

			it('can select a palette option', function () {
				if (
					!config?.selectors?.sidebar?.facetWrapper &&
					!config?.selectors?.sidebar?.facetTitle &&
					!config?.selectors?.sidebar?.facetCollapseButton &&
					!config?.selectors?.sidebar?.facetOption
				)
					this.skip();

				cy.snapStore().then((store) => {
					// find first display='palette' facet
					const paletteFacet = store.facets.filter((facet) => facet.display === 'palette')[0];
					let facetPaletteElement = null;
					paletteFacet &&
						cy
							.get(`${config.selectors.sidebar.facetWrapper}`)
							.each((facet, index) => {
								// find matching facet in dom
								const title = facet.find(config.selectors.sidebar.facetTitle);
								if (!facetPaletteElement && paletteFacet.label === title.text()) {
									facetPaletteElement = facet;
									if (paletteFacet.collapse) {
										// toggle visibility if collapsed
										cy.get(facet.find(config.selectors.sidebar.facetCollapseButton)).click();
									}
								}
							})
							.then(() => {
								// click on an option in facet and ensure urlManager contains new state
								const facetPaletteOption = facetPaletteElement.find(config.selectors.sidebar.facetOption)[0];
								const clickedValue = facetPaletteOption.innerText;
								cy.get(facetPaletteOption).click();
								cy.snapStore().then((store) => {
									expect(Object.keys(store.controller.urlManager.state.filter)).to.contain(paletteFacet.field);
									const value = store.controller.urlManager.state.filter[paletteFacet.field][0];
									expect(clickedValue).to.contain(value);
								});
							});
				});
			});

			it.skip('can select a slider option', function () {
				//TODO: update once new slider is ready
				if (!config?.selectors?.sidebar?.facetWrapper && !config?.selectors?.sidebar?.facetTitle && !config?.selectors?.sidebar?.facetCollapseButton)
					this.skip();

				cy.snapStore().then((store) => {
					// find first display='slider' facet
					const sliderFacet = store.facets.filter((facet) => facet.display === 'slider')[0];
					let facetSliderElement = null;

					sliderFacet &&
						cy
							.get(`${config.selectors.sidebar.facetWrapper}`)
							.each((facet, index) => {
								// find matching facet in dom
								const title = facet.find(config.selectors.sidebar.facetTitle);
								if (!facetSliderElement && sliderFacet.label === title.text()) {
									facetSliderElement = facet;
									if (sliderFacet.collapse) {
										// toggle visibility if collapsed
										cy.get(facet.find(config.selectors.sidebar.facetCollapseButton)).click();
									}
								}
							})
							.then(() => {
								// use left/right arrows to change slider values
								cy.get(facetSliderElement.find('.rc-slider-handle-1')) // left handle
									.should('have.attr', 'aria-valuenow', sliderFacet.active.low)
									.should('have.attr', 'aria-valuemin', sliderFacet.active.low)
									.should('have.attr', 'aria-valuemax', sliderFacet.active.high)
									.type('{rightarrow}')
									.should('have.attr', 'aria-valuenow', sliderFacet.active.low + sliderFacet.step)
									.should('have.attr', 'aria-valuemin', sliderFacet.active.low)
									.should('have.attr', 'aria-valuemax', sliderFacet.active.high);
								cy.get(facetSliderElement.find('.rc-slider-handle-2')) // right handle
									.should('have.attr', 'aria-valuenow', sliderFacet.active.high)
									.should('have.attr', 'aria-valuemin', sliderFacet.active.low)
									.should('have.attr', 'aria-valuemax', sliderFacet.active.high)
									.type('{leftarrow}')
									.should('have.attr', 'aria-valuenow', sliderFacet.active.high - sliderFacet.step)
									.should('have.attr', 'aria-valuemin', sliderFacet.active.low)
									.should('have.attr', 'aria-valuemax', sliderFacet.active.high);
							})
							.then(() => {
								cy.snapStore().then((store) => {
									const updatedSliderFacet = store.facets.filter((facet) => facet.display === 'slider')[0];
									expect(updatedSliderFacet.active.low).to.equal(sliderFacet.active.low + sliderFacet.step);
									expect(updatedSliderFacet.active.high).to.equal(sliderFacet.active.high - sliderFacet.step);
								});
							});
				});
			});

			it('can select a hierarchy option', function () {
				if (
					!config?.selectors?.sidebar?.facetWrapper &&
					!config?.selectors?.sidebar?.facetTitle &&
					!config?.selectors?.sidebar?.facetCollapseButton &&
					!config?.selectors?.sidebar?.facetOption
				)
					this.skip();

				cy.snapStore().then((store) => {
					// find first display='hierarchy' facet
					const hierarchyFacet = store.facets.filter((facet) => facet.display === 'hierarchy')[0];
					let facetHierarchyElement = null;
					hierarchyFacet &&
						cy
							.get(`${config.selectors.sidebar.facetWrapper}`)
							.each((facet, index) => {
								// find matching facet in dom
								const title = facet.find(config.selectors.sidebar.facetTitle);
								if (!facetHierarchyElement && hierarchyFacet.label === title.text()) {
									facetHierarchyElement = facet;
									if (hierarchyFacet.collapse) {
										// toggle visibility if collapsed
										cy.get(facet.find(config.selectors.sidebar.facetCollapseButton)).click();
									}
								}
							})
							.then(() => {
								// click on an option in facet and ensure urlManager contains new state
								const facetHierarchyOption = facetHierarchyElement.find(config.selectors.sidebar.facetOption)[0];
								const clickedValue = facetHierarchyOption.innerText.split('(')[0].trim();
								cy.get(facetHierarchyOption).click();
								cy.snapStore().then((store) => {
									expect(Object.keys(store.controller.urlManager.state.filter)).to.contain(hierarchyFacet.field);
									const value = store.controller.urlManager.state.filter[hierarchyFacet.field][0].split(hierarchyFacet.hierarchyDelimiter).pop();
									expect(clickedValue).to.contain(value);
								});
							});
				});
			});

			it('can clear all facets', function () {
				if (!config?.selectors?.sidebar?.removeAllFacetsButton) this.skip();

				cy.snapStore().then((store) => {
					if (store.filters.length === 0) this.skip();
				});
				cy.get(config?.selectors?.sidebar?.removeAllFacetsButton).should('exist').click();
				cy.snapStore().then((store) => {
					expect(store.filters.length).to.equal(0);
				});
			});
		});

		describe('Results', () => {
			it('has correct product count per page', function () {
				if (!config?.selectors?.results?.productWrapper) this.skip();

				cy.snapStore().then((store) => {
					cy.get(config.selectors.results?.productWrapper).should('exist').should('have.length', store.pagination.pageSize);
				});
			});
		});
	});
});
