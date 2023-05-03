/* searchspring imports */
import { Snap } from '@searchspring/snap-preact';
import { getContext } from '@searchspring/snap-toolbox';

/* local imports */
import { plugin } from './scripts/plugin';
import './styles/custom.scss';

/*
	context and background filtering
 */

const context = getContext(['collection', 'tags', 'template', 'shopper']);
const backgroundFilters = [];

if (context.collection?.handle) {
	// set background filter
	if (context.collection.handle != 'all') {
		backgroundFilters.push({
			field: 'collection_handle',
			value: context.collection.handle,
			type: 'value',
			background: true,
		});
	}
}

/*
	configuration and instantiation
 */

const config = {
	context,
	features: {
		integratedSpellCorrection: {
			enabled: true,
		},
	},
	url: {
		parameters: {
			core: {
				query: { name: 'q' },
			},
		},
	},
	client: {
		globals: {
			siteId: '1mvf26',
		},
	},
	instantiators: {
		recommendation: {
			components: {
				Default: async () => {
					return (await import('./components/Recommendations/Recs')).Recs;
				},
			},
			config: {
				branch: BRANCHNAME,
			},
		},
	},
	controllers: {
		search: [
			{
				config: {
					id: 'search',
					plugins: [[plugin]],
					globals: {
						filters: backgroundFilters,
					},
				},
				targeters: [
					{
						selector: '#faceted-search-container',
						component: async () => {
							return (await import('./components/Sidebar')).Sidebar;
						},
						hideTarget: true,
					},
					{
						selector: '#product-listing-container',
						component: async () => {
							return (await import('./components/Content')).Content;
						},
						hideTarget: true,
					},
					{
						selector: '.page-heading',
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
					selector: '#nav-quick-search',
				},
				targeters: [
					{
						selector: '#nav-quick-search',
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
