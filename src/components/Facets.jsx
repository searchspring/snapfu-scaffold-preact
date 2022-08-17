import { h } from 'preact';
import { observer } from 'mobx-react';
import { FacetSlider, withController } from '@searchspring/snap-preact-components';

export const Facets = withController(
	observer((props) => {
		const { facets } = props.controller.store;

		return (
			facets.length !== 0 && (
				<div class="ss__facets">
					{facets.map((facet) => (
						<Facet facet={facet} />
					))}
				</div>
			)
		);
	})
);

export const Facet = withController(
	observer((props) => {
		const { facet } = props;

		return (
			facet && (
				<div class="ss__facet">
					<h5
						class="ss__facet__header"
						onClick={() => {
							facet.toggleCollapse();
						}}
					>
						{facet.label}
					</h5>

					<div class={`ss__facet--field-${facet.field} ss__facet--display-${facet.display} ${facet.collapsed ? 'ss__facet--collapsed' : ''}`}>
						<div class="collapsible-content__inner">
							{{
								grid: <div>grid component</div>,
								palette: <div>palette component</div>,
								hierarchy: <div>hierarchy component</div>,
								slider: <FacetSlider facet={facet} />,
							}[facet.display] || <FacetOptionsList facet={facet} />}
						</div>
					</div>
				</div>
			)
		);
	})
);

const FacetOptionsList = observer((props) => {
	const facet = props.facet;
	const values = facet.refinedValues;

	return (
		<ul class="ss__facet-options-list">
			{values?.map((value) => {
				return (
					<li class={`ss__facet-options-list__option ${value.filtered ? 'ss__facet-options-list__option--active' : ''}`}>
						<a {...value.url.link} title={`Remove filter ${value.label}`}>
							{value.label}
						</a>
					</li>
				);
			})}
		</ul>
	);
});
