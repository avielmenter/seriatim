import * as React from 'react';

import PageTemplate from './pageTemplate';

type ComponentProps = {}

const NotFound: React.SFC<ComponentProps> = (_) => (
	<PageTemplate>
		<div id="msg404">
			<h2><em>Oops!</em></h2>
			<h3>
				We could not find a URL at the specified location.
				Click <a href="/">here</a> to return home.
			</h3>
		</div>
	</PageTemplate>
)

export default NotFound;