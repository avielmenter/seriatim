import * as React from 'react';
import { connect } from 'react-redux';

import { Error } from '../store/data/error';
import { DispatchProps, mapDispatchToProps } from '../store';

type StateProps = {

}

type AttrProps = {
	error: Error,
	index: number
}

type ComponentProps = StateProps & AttrProps & DispatchProps;

const ErrorMessage: React.SFC<ComponentProps> = (props) => {
	return (
		<div className="errorMessage">
			<div className="docContentWidth">
				<strong>Error: </strong>
				{props.error}
				<span className="removeError" onClick={() => props.actions.errors.removeError(props.index)}>x</span>
			</div>
		</div>
	)
}

const mapStateToProps = (state: any) => ({});

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(ErrorMessage);