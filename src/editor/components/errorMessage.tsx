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

function friendlyErrorMessage(e: Error): string {
	switch (e.code) {
		case 'NOT_LOGGED_IN':
			return "You must be logged in to view this document";
		case 'INSUFFICIENT_PERMISSIONS':
			return "You do not have permission to view this document";
		case 'NOT_FOUND':
			return "No document could be found with the specified ID";
		default:
			console.log("WEIRD ERROR: " + e.code);
			return e.error;
	}
}

const ErrorMessage: React.SFC<ComponentProps> = (props) => {
	return (
		<div className="errorMessage">
			<div className="docContentWidth">
				<strong>Error: </strong>
				{friendlyErrorMessage(props.error)}
				<span className="removeError" onClick={() => props.actions.errors.removeError(props.index)}>x</span>
			</div>
		</div>
	)
}

const mapStateToProps = (state: any) => ({});

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(ErrorMessage);