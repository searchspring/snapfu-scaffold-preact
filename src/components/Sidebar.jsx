import { h, Component } from 'preact';
import { observer } from 'mobx-react';

import { Banner, ControllerProvider } from '@searchspring/snap-preact-components';
import { Facets } from './Facets';
import { FilterSummary } from './FilterSummary';
import { FilterMessages } from './FilterMessages';

@observer
export class Sidebar extends Component {
	render() {
		const controller = this.props.controller;
		const merchandising = controller.store.merchandising;

		return (
			<ControllerProvider controller={controller}>
				<div class="ss__sidebar">
					<FilterSummary />
					<Facets />
					<FilterMessages />
					<Banner content={merchandising.content} type="left" />
				</div>
			</ControllerProvider>
		);
	}
}
