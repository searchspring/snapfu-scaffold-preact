import { h, Fragment, render } from 'preact';

/* searchspring imports */
import { SnapClient } from '@searchspring/snap-client';

import { UrlManager, UrlTranslator, reactLinker } from '@searchspring/snap-url-manager';
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

const searchControllerConfig = {
	id: 'search',
};

const searchController = new SearchController(searchControllerConfig, {
	client,
	store: new SearchStore(),
	urlManager: new UrlManager(new UrlTranslator({ queryParameter: 'search' }), reactLinker),
	eventManager: new EventManager(),
	profiler: new Profiler(),
	logger: new Logger(),
});

// custom codez
searchController.use(middleware);

// render <Content/> component into #searchspring-content
searchController.on('init', async () => {
	new DomTargeter(
		[
			{
				selector: '#searchspring-content',
				component: <Content store={searchController.store} />,
			},
		],
		(target, elem) => {
			render(target.component, elem);
		}
	);
});

searchController.init();
searchController.search();

// for testing purposes
window.sssnap = {
	search: searchController,
};
