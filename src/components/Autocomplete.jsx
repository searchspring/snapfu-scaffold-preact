import { h, Fragment, Component } from 'preact';
import { observer } from 'mobx-react';

import { Autocomplete as LibraryAutocomplete } from '@searchspring/snap-preact-components';

@observer
export class Autocomplete extends Component {
	render() {
		const { controller, input } = this.props;

		return <LibraryAutocomplete controller={controller} input={input} />;
	}
}
