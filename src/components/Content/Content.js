import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';
import { StoreProvider } from '../../services/providers';

@observer
export class Content extends Component {
	render() {
		const store = this.props.store;

		return (
			<StoreProvider store={store}>
				<img src="https://searchspring.com/wp-content/uploads/2020/01/SearchSpring-Primary-FullColor-800-1-1-640x208.png" />
			</StoreProvider>
		);
	}
}
