import { h, Fragment, render } from 'preact';
import { configure as configureMobx } from 'mobx';

/* searchspring imports */
import SnapClient from '@searchspring/snap-client-javascript';

import { UrlManager, QueryStringTranslator, ReactLinker } from '@searchspring/snap-url-manager';
import { EventManager } from '@searchspring/snap-event-manager';
import { Profiler } from '@searchspring/snap-profiler';
import { Logger } from '@searchspring/snap-logger';
import { DomTargeter } from '@searchspring/snap-toolbox';

import { SearchController } from '@searchspring/snap-controller';
import { SearchStore } from '@searchspring/snap-store-mobx';

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
			merchandising: false,
		},
	},
};

const cntrlr = new SearchController(cntrlrConfig, {
	client,
	store: new SearchStore(),
	urlManager: new UrlManager(new QueryStringTranslator({ queryParameter: 'search_query' }), ReactLinker),
	eventManager: new EventManager(),
	profiler: new Profiler(),
	logger: new Logger(),
});

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

// for testing purposes
window.sssnap = {
	search: cntrlr,
};
