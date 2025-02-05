import { h, Fragment } from 'preact';
import { observer } from 'mobx-react';
import {
	Facets,
	FilterSummary,
	Pagination,
	Banner,
	Results,
	Slideout,
	useMediaQuery,
	ControllerProvider,
} from '@searchspring/snap-preact-components';

import { NoResults } from './Results';
import { SortBy } from './SortBy';

export const Content = observer((props) => {
	const controller = props.controller;
	const {
		store,
		store: { pagination, merchandising },
	} = controller;

	const isMobile = useMediaQuery('(max-width: 767px)');

	return (
		controller.store.loaded && (
			<ControllerProvider controller={controller}>
				<div className="ss__content">
					<Banner content={merchandising.content} type="header" />
					<Banner content={merchandising.content} type="banner" />

					{pagination.totalResults > 0 ? (
						<div>
							{isMobile && store.facets.length > 0 && store.pagination.totalResults > 0 && (
								<Slideout buttonContent={<SlideoutButton />}>
									<SlideoutContent />
								</Slideout>
							)}

							<SortBy />

							<Results results={store.results}></Results>

							<Pagination pagination={store.pagination} />
						</div>
					) : (
						pagination.totalResults === 0 && <NoResults />
					)}

					<Banner content={merchandising.content} type="footer" />
				</div>
			</ControllerProvider>
		)
	);
});

const SlideoutButton = () => {
	return <button>Filters</button>;
};

const SlideoutContent = (props) => {
	const { toggleActive, active } = props;

	return (
		active && (
			<>
				{/* slideout content here */}
				<FilterSummary />
				<Facets />
			</>
		)
	);
};
