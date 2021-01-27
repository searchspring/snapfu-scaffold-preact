import { h, Fragment, render } from 'preact';

/* searchspring imports */
import { SearchController } from '@searchspring/snap-controller-search';
import SnapClient from '@searchspring/snap-client-javascript';
import { SearchStore } from '@searchspring/snap-store-mobx-search';
import { UrlManager, QueryStringTranslator, ReactLinker } from '@searchspring/snap-url-manager';
import { EventManager } from '@searchspring/snap-event-manager';
import { Profiler } from '@searchspring/snap-profiler';
import { DomTargeter } from '@searchspring/snap-toolbox';

/* local imports */
import config from '../package.json';
import { middleware } from './scripts/custom';
import './styles/custom.scss';

import { Content } from './components/Content/Content';

/*
	configuration and instantiation
 */

let globals = {
	siteId: config.searchspring.siteId,
};

const client = new SnapClient(globals);

/*
	search
 */

const cntrlrConfig = {
	id: 'search',
	settings: {
		redirects: {
			enabled: false,
		},
	},
};

const cntrlr = (window.cntrlr = new SearchController(cntrlrConfig, {
	client,
	store: new SearchStore(),
	urlManager: new UrlManager(new QueryStringTranslator(), ReactLinker),
	eventManager: new EventManager(),
	profiler: new Profiler(),
}));

// custom codez
cntrlr.use(middleware);

// render <Content/> component into #searchspring-content
cntrlr.on('init', async () => {
	new DomTargeter(
		[
			{
				selector: '#searchspring-content',
				component: <Content store={cntrlr.store} />,
			},
		],
		(target, elem) => {
			render(target.component, elem);
		}
	);
});

cntrlr.init();
cntrlr.search();
