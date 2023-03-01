import { h, Fragment } from 'preact';
import { observer } from 'mobx-react';
import { withController } from '@searchspring/snap-preact-components';

export const SortBy = withController(
	observer((props) => {
		const controller = props.controller;
		const { sorting } = controller.store;

		return (
			sorting.length !== 0 && (
				<div className="ss__sorting">
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
	})
);
