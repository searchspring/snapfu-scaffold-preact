import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';
import { ControllerProvider } from '@searchspring/snap-preact-components';
@observer
export class Content extends Component {
	render() {
		const controller = this.props.controller;

		return (
			<ControllerProvider controller={controller}>
				<img src="https://searchspring.com/wp-content/uploads/2020/01/SearchSpring-Primary-FullColor-800-1-1-640x208.png" />
			</ControllerProvider>
		);
	}
}
