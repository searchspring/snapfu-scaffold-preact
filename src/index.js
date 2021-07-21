import { h, Fragment, render } from 'preact';
import { configure as configureMobx } from 'mobx';

/* searchspring imports */
import { Snap } from '@searchspring/snap-preact';

/* local imports */
import { searchspring } from '../package.json';
import { plugin } from './scripts/custom';
import './styles/custom.scss';

import { Content } from './components/Content/Content';

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
				},
				targets: [
					{
						selector: '#searchspring-content',
						component: Content,
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

/*
	search middleware plugin
	*/

search.use(plugin);
