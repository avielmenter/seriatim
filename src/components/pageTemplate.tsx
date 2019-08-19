import * as React from 'react';

type ComponentProps = {};

const PageTemplate: React.SFC<ComponentProps> = (props) => (
	<div>
		<header>
			<div className="headerContent flexibleContentWidth flexHeader">
				<div>
					<h3>
						<a href="/">
							<img className="mini_logo" src="/assets/logo.png" alt="logo" /> seriatim
							<span id="logo_bullet" style={{ margin: '0.5ch' }}>&#x2022;</span>
							io
						</a>
					</h3>
				</div>
			</div>
		</header>
		<main className="mainContentWidth">
			{props.children}
		</main>
	</div>
);

export default PageTemplate;