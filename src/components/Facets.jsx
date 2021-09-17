import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';
import { FacetSlider, withController } from '@searchspring/snap-preact-components';

@withController
@observer
export class Facets extends Component {
	render() {
		const { facets } = this.props.controller.store;

		return (
			facets.length !== 0 && (
				<div class="ss__facets">
					{facets.map((facet) => (
						<Facet facet={facet} />
					))}
				</div>
			)
		);
	}
}

@withController
@observer
export class Facet extends Component {
	render() {
		const { facet } = this.props;

		return (
			facet && (
				<div class="ss__facet">
					<h5
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
	}
}

@observer
class FacetOptionsList extends Component {
	render() {
		const facet = this.props.facet;
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
	}
}
