import * as React from 'react';

type StateProps = {

}

type AttrProps = {

}

type ComponentProps = StateProps & AttrProps;

const LoadingSpinner: React.SFC<ComponentProps> = (props) => {
	return (
		<div className="spinner">
			<div className="bounce1"></div>
			<div className="bounce2"></div>
			<div className="bounce3"></div>
		</div>
	)
}

export default LoadingSpinner;