import { h } from 'preact';
import { observer } from 'mobx-react';

import { Recommendation } from '@searchspring/snap-preact-components';

import './Recs.scss';

export const Recs = observer((props) => {
	const controller = props.controller;
	const store = controller?.store;

	if (!controller.store.loaded && !controller.store.loading) {
		controller.search();
	}

	const parameters = store?.profile?.display?.templateParameters;

	return store.results.length > 0 && <Recommendation controller={controller} title={parameters?.title} />;
});
