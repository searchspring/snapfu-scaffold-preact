import { h, Fragment } from 'preact';
import { observer } from 'mobx-react';

export const SearchHeader = observer((props) => {
	const { controller } = props;
	const {
		store,
		store: { merchandising, pagination, search },
	} = controller;
	const originalQuery = search.originalQuery;
	const query = search.query;
	const landingPage = merchandising.landingPage;
	return (
		store.loaded && (
			<div className="ss__search-header">
				{landingPage ? (
					<h3 className="ss__search-header--landingPageTitle">{landingPage.title}</h3>
				) : (
					<>
						{pagination.totalResults ? (
							<h1 className="ss__search-header--results">
								{`Showing `}
								{pagination.multiplePages && <span className="ss__search-header__count-range">{` ${pagination.begin} - ${pagination.end} of `}</span>}
								<span className="ss__search-header__count-total">{pagination.totalResults}</span>
								{` result${pagination.totalResults == 1 ? '' : 's'}`}
								{search?.query && (
									<span>
										{` for `}
										<span className="ss__search-header__query">"{search.query.string}"</span>
									</span>
								)}
							</h1>
						) : (
							pagination.totalResults === 0 && (
								<h1 className="ss__search-header--noresults">
									{search?.query ? (
										<span>
											No results for <span className="ss__search-header__query">"{search.query.string}"</span> found.
										</span>
									) : (
										<span>No results found.</span>
									)}
								</h1>
							)
						)}

						{originalQuery && (
							<div className="ss__oq">
								No results found for "{originalQuery.string}", showing results for "{query.string}"
							</div>
						)}
					</>
				)}
			</div>
		)
	);
});
