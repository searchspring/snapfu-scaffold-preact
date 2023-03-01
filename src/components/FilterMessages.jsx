import { h, Fragment } from 'preact';
import { observer } from 'mobx-react';
import { withController } from '@searchspring/snap-preact-components';

export const FilterMessages = withController(
	observer((props) => {
		const { facets, filters, pagination } = props.controller.store;

		let message = '';
		if (pagination.totalResults === 0 && filters.length === 0) {
			message = (
				<Fragment>
					There are no results to refine. If you need additional help, please try our search "<strong>Suggestions</strong>".
				</Fragment>
			);
		} else if (pagination.totalResults === 0 && filters.length) {
			message = 'If you are not seeing any results, try removing some of your selected filters.';
		} else if (pagination.totalResults && filters.length === 0) {
			message = 'There are no filters to refine by.';
		}

		return (
			facets.length === 0 && (
				<div className="ss__filter-messages">
					{message && (
						<p className="ss__filter-messages__content" style="margin-top: 0;">
							{message}
						</p>
					)}
				</div>
			)
		);
	})
);
