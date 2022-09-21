import { h, Fragment } from 'preact';
import { observer } from 'mobx-react';
import { Autocomplete as LibraryAutocomplete } from '@searchspring/snap-preact-components';

export const Autocomplete = observer((props) => {
	const { controller, input } = props;

	return <LibraryAutocomplete controller={controller} input={input} />;
});
