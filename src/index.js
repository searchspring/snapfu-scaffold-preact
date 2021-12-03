/* searchspring imports */
import { Snap } from '@searchspring/snap-preact';

/* local imports */
import { plugin } from './scripts/plugin';
import './styles/custom.scss';

/*
	context and background filtering
 */

const context = getContext(['shopper']);

/*
	configuration and instantiation
 */

const config = {
	context,
	url: {
		parameters: {
			core: {
				query: { name: 'q' },
			},
		},
	},
	client: {
		globals: {
			siteId: '{{snapfu.siteId}}',
		},
	},
	controllers: {
		search: [
			{
				config: {
					id: 'search',
					plugins: [[plugin]],
				},
				targeters: [
					{
						selector: '#searchspring-sidebar',
						component: async () => {
							return (await import('./components/Sidebar')).Sidebar;
						},
						hideTarget: true,
					},
					{
						selector: '#searchspring-content',
						component: async () => {
							return (await import('./components/Content')).Content;
						},
						hideTarget: true,
					},
					{
						selector: '#searchspring-header',
						component: async () => {
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
				targeters: [
					{
						selector: '#search-input',
						component: async () => {
							return (await import('./components/Autocomplete')).Autocomplete;
						},
					},
				],
			},
		],
	},
};

const snap = new Snap(config);

snap.getController('search').then((search) => {
	// search controller available
});
