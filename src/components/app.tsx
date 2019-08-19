import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import DocumentList from './documentList';
import Login from './login/login'
import NotFound from './notFound';

type ComponentProps = {}

const App: React.SFC<ComponentProps> = (_) => (
	<Router>
		<div>
			<Switch>
				<Route exact path='/documents' component={DocumentList} />
				<Route path='/login/:loginMethod(facebook|google|twitter)/:merge(callback|merge)' component={Login} />
				<Route component={NotFound} />
			</Switch>
		</div>
	</Router>
)

export default App;