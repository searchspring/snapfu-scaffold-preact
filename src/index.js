import { h, Fragment, render } from 'preact';
import { configure as configureMobx } from 'mobx';

/* searchspring imports */
import { Snap } from '@searchspring/snap-preact';

/* local imports */
import { searchspring } from '../package.json';
import { middleware } from './scripts/middleware';
import './styles/custom.scss';

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
	url: {
		parameters: {
			core: {
				query: { name: 'q' },
			},
		},
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
					plugins: [[middleware]],
				},
				targets: [
					{
						selector: '#searchspring-sidebar',
						component: async() => {
							return (await import('./components/Sidebar')).Sidebar;
						},
						hideTarget: true,
					},
					{
						selector: '#searchspring-content',
						component: async() => {
							return (await import('./components/Content')).Content;
						},
						hideTarget: true,
					},
					{
						selector: '#searchspring-header',
						component: async() => {
							return (await import('./components/SearchHeader')).SearchHeader;
						},
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
						component: async() => {
							return (await import('@searchspring/snap-preact-components')).Autocomplete;
						},
					},
				],
			},
		],
	},
};

const snap = new Snap(config);
const { search, autocomplete } = snap.controllers;
