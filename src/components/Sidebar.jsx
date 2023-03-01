import { h, Fragment } from 'preact';
import { observer } from 'mobx-react';
import { Banner, ControllerProvider } from '@searchspring/snap-preact-components';

import { CustomFacets } from './Facets';
import { FilterSummary } from './FilterSummary';
import { FilterMessages } from './FilterMessages';

export const Sidebar = observer((props) => {
	const controller = props.controller;
	const merchandising = controller.store.merchandising;

	return (
		<ControllerProvider controller={controller}>
			<div className="ss__sidebar">
				<FilterSummary />
				<CustomFacets />
				<FilterMessages />
				<Banner content={merchandising.content} type="left" />
			</div>
		</ControllerProvider>
	);
});
