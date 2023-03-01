import { h, Fragment } from 'preact';
import { observer } from 'mobx-react';
import { FacetSlider, FacetGridOptions, FacetPaletteOptions, FacetHierarchyOptions, withController } from '@searchspring/snap-preact-components';

export const CustomFacets = withController(
	observer((props) => {
		const { facets } = props.controller.store;

		return (
			facets.length !== 0 && (
				<div className="ss__facets">
					{facets.map((facet) => (
						<CustomFacet facet={facet} />
					))}
				</div>
			)
		);
	})
);

export const CustomFacet = withController(
	observer((props) => {
		const { facet } = props;

		return (
			facet && (
				<div className="ss__facet">
					<h5
						className="ss__facet__header"
						onClick={() => {
							facet.toggleCollapse();
						}}
					>
						{facet.label}
					</h5>

					<div className={`ss__facet--field-${facet.field} ss__facet--display-${facet.display} ${facet.collapsed ? 'ss__facet--collapsed' : ''}`}>
						<div className="collapsible-content__inner ss__facet-options">
							{{
								grid: <FacetGridOptions values={facet.values} />,
								palette: <FacetPaletteOptions values={facet.values} />,
								hierarchy: <FacetHierarchyOptions values={facet.values} />,
								slider: <FacetSlider facet={facet} />,
							}[facet.display] || <CustomFacetOptionsList facet={facet} />}
						</div>
					</div>
				</div>
			)
		);
	})
);

const CustomFacetOptionsList = observer((props) => {
	const facet = props.facet;
	const values = facet.refinedValues;

	return (
		<ul className="ss__facet-options-list">
			{values?.map((value) => {
				return (
					<li className={`ss__facet-options-list__option ${value.filtered ? 'ss__facet-options-list__option--active' : ''}`}>
						<a {...value.url.link} title={`Remove filter ${value.label}`}>
							{value.label}
						</a>
					</li>
				);
			})}
		</ul>
	);
});
