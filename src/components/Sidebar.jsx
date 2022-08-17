import { h } from 'preact';
import { observer } from 'mobx-react';
import { Banner, ControllerProvider } from '@searchspring/snap-preact-components';

import { Facets } from './Facets';
import { FilterSummary } from './FilterSummary';
import { FilterMessages } from './FilterMessages';

export const Sidebar = observer((props) => {
	const controller = props.controller;
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
});
