import { h } from 'preact';
import { observer } from 'mobx-react';
import { withController } from '@searchspring/snap-preact-components';

export const FilterSummary = withController(
	observer((props) => {
		const controller = props.controller;
		const {
			store: { filters },
		} = controller;
		const removeAll = controller?.urlManager.remove('filter');

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
					<a {...removeAll.link} className="ss-list-link ss__filters__clear-all">
						Clear All
					</a>
				</ul>
			)
		);
	})
);
