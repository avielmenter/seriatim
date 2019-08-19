import * as React from 'react';

import * as OAuth from '../../oauth';

import PageTemplate from '../pageTemplate';

type ComponentProps = {
	match: {
		params: {
			loginMethod: OAuth.LoginMethod,
			merge: 'callback' | 'merge'
		}
	}
}

const Login: React.SFC<ComponentProps> = (props) => {
	const { loginMethod, merge } = props.match.params;

	const queryString = window.location.search;
	const homeRedirect = SERIATIM_CLIENT_URL;

	React.useEffect(() => {
		document.title = "Logging in...";

		OAuth.verifyLogin(loginMethod, queryString, merge == 'merge')
			.then(r => { window.location.href = r })
			.catch(() => { window.location.href = homeRedirect });
	});

	return (
		<PageTemplate>
			<div className="fullPageMessage">
				<h2><em>You are being logged in.</em></h2>
				<h3>You should be redirected shortly...</h3>
			</div>
		</PageTemplate>
	);
}

export default Login;