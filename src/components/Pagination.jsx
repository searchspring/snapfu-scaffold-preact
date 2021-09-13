import { h, Component } from 'preact';
import { observer } from 'mobx-react';

import { withController } from '@searchspring/snap-preact-components';

@withController
@observer
export class Pagination extends Component {
	render() {
		const controller = this.props.controller;
		const {
			store: { pagination },
		} = controller;
		const pages = pagination.getPages(5);

		return (
			<div class="ss__pagination">
				{pagination.previous && (
					<span class="ss__pagination__prev">
						<a {...pagination.previous.url.link} title="Previous">
							Prev
						</a>
					</span>
				)}

				{pages.map((page) => (
					<span key={page.key} class={`ss__pagination__page ${page.active ? 'ss__pagination__page--current' : ''}`}>
						<a {...page.url.link}>{page.number}</a>
					</span>
				))}

				{pagination.next && (
					<span class="ss__pagination__next">
						<a {...pagination.next.url.link} title="Next">
							Next
						</a>
					</span>
				)}
			</div>
		);
	}
}
