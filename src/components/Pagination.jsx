import { h, Fragment } from 'preact';
import { observer } from 'mobx-react';
import { withController } from '@searchspring/snap-preact-components';

export const Pagination = withController(
	observer((props) => {
		const controller = props.controller;
		const {
			store: { pagination },
		} = controller;
		const pages = pagination.getPages(5);

		return (
			<div className="ss__pagination">
				{pagination.previous && (
					<span className="ss__pagination__page--previous">
						<a {...pagination.previous.url.link} title="Previous">
							Prev
						</a>
					</span>
				)}

				{pages.map((page) => (
					<span className={`ss__pagination__page ${page.active ? 'ss__pagination__page--current' : ''}`}>
						<a {...page.url.link}>{page.number}</a>
					</span>
				))}

				{pagination.next && (
					<span className="ss__pagination__page--next">
						<a {...pagination.next.url.link} title="Next">
							Next
						</a>
					</span>
				)}
			</div>
		);
	})
);
