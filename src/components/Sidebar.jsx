import { h, Fragment } from 'preact';
import { observer } from 'mobx-react';
import { Banner, FilterSummary, Facets, ControllerProvider } from '@searchspring/snap-preact-components';
import { FilterMessages } from './FilterMessages';

export const Sidebar = observer((props) => {
	const controller = props.controller;
	const merchandising = controller.store.merchandising;

	return (
		controller.store.loaded && (
			<ControllerProvider controller={controller}>
				<div className="ss__sidebar">
					<FilterSummary controller={controller} />
					<Facets controller={controller} />
					<FilterMessages />
					<Banner content={merchandising.content} type="left" />
				</div>
			</ControllerProvider>
		)
	);
});
