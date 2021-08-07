import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { Banner, Slideout, useMediaQuery, ControllerProvider } from '@searchspring/snap-preact-components';

import { Results, NoResults } from './Results';
import { SortBy } from './SortBy';
import { Facets } from './Facets';
import { FilterSummary } from './FilterSummary';
import { Pagination } from './Pagination';

@observer
export class Content extends Component {
	render() {
		const controller = this.props.controller;
		const {
			store,
			store: { pagination, merchandising },
		} = controller;
		const isMobile = useMediaQuery('(max-width: 767px)');

		return (
			controller.store.loaded && (
				<ControllerProvider controller={controller}>
					<div class="ss__content">
						<Banner content={merchandising.content} type="header" />
						<Banner content={merchandising.content} type="banner" />

						{pagination.totalResults > 0 ? (
							<div>
								{isMobile && store.facets.length && store.pagination.totalResults && (
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
	}
}

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
