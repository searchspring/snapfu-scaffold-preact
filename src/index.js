import { h, Fragment, render } from 'preact';
import { configure as configureMobx } from 'mobx';

/* searchspring imports */
import { Snap } from '@searchspring/snap-preact';
import { Autocomplete } from '@searchspring/snap-preact-components';

/* local imports */
import { searchspring } from '../package.json';
import { middleware } from './scripts/middleware';
import './styles/custom.scss';

import { SearchHeader } from './components/SearchHeader';
import { Sidebar } from './components/Sidebar';
import { Content } from './components/Content';

/*
	configuration and instantiation
 */

configureMobx({
	useProxies: 'never',
});

/*
	configuration and instantiation
 */

const config = {
	parameters: {
		query: { name: 'q' },
	},
	client: {
		globals: {
			siteId: searchspring.siteId,
		},
	},
	controllers: {
		search: [
			{
				config: {
					id: 'search',
					use: middleware,
				},
				targets: [
					{
						selector: '#searchspring-sidebar',
						component: Sidebar,
						hideTarget: true,
					},
					{
						selector: '#searchspring-content',
						component: Content,
						hideTarget: true,
					},
					{
						selector: '#searchspring-header',
						component: SearchHeader,
						hideTarget: true,
					},
				],
			},
		],
		autocomplete: [
			{
				config: {
					id: 'autocomplete',
					selector: '#search-input',
				},
				targets: [
					{
						selector: '#search-input',
						component: Autocomplete,
					},
				],
			},
		],
	},
};

const snap = new Snap(config);
const { search, autocomplete } = snap.controllers;
