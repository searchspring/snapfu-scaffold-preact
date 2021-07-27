import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';
import { withController } from '@searchspring/snap-preact-components';

@withController
@observer
export class FilterSummary extends Component {
	render() {
		const controller = this.props.controller;
		const {
			store: { filters },
		} = controller;

		return (
			filters.length !== 0 && (
				<ul class="ss__filters">
					{filters.map((filter) => (
						<li class="ss__filters__filter">
							<a {...filter.url.link} title={`Remove filter ${filter.label}`}>
								{filter.label}
							</a>
						</li>
					))}
				</ul>
			)
		);
	}
}
