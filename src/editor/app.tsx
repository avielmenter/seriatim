import * as React from 'react';

import { Provider } from 'react-redux';
import { store } from './store';

import Document from './components/document/document';

export default class App extends React.Component {
	render() {
		return (
			<Provider store={store}>
				<Document />
			</Provider>
		)
	}
}