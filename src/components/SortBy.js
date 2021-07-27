import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';
import { withController } from '@searchspring/snap-preact-components';

@withController
@observer
export class SortBy extends Component {
	render() {
		const controller = this.props.controller;
		const { sorting } = controller.store;

		return (
			sorting.length !== 0 && (
				<div class="ss__sorting">
					<label for="ss__sort--select">Sort</label>

					<select
						name="ss__sort--select"
						id="ss__sort--select"
						onChange={(e) => {
							const selectedOption = sorting.options.filter((option) => option.value == e.target.value).pop();
							selectedOption && selectedOption.url.go();
						}}
					>
						{sorting.options.map((option) => (
							<option value={option.value} selected={option.value === sorting.current.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			)
		);
	}
}
