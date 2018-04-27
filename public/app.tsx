import * as React from 'react';

import { Provider } from 'react-redux';
import * as Store from './store';

import * as Doc from './store/data/document';

import Document from './components/document';

export default class App extends React.Component {
	render() {
		return (
			<Provider store={Store.store}>
				<Document />
			</Provider>
		)
	}
}