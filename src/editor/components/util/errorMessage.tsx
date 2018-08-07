import * as React from 'react';
import { connect } from 'react-redux';

import { Error } from '../..//store/data/error';
import { DispatchProps, mapDispatchToProps } from '../../store';

type StateProps = {

}

type AttrProps = {
	error: Error,
	index: number
}

type ComponentProps = StateProps & AttrProps & DispatchProps;

function friendlyErrorMessage(e: Error): JSX.Element {
	switch (e.code) {
		case 'NOT_LOGGED_IN':
			return <span>You are not <a href={SERIATIM_CLIENT_URL} target='_blank'>logged in</a>.</span>;
		case 'INSUFFICIENT_PERMISSIONS':
			return <span>You do not have permission to view this document</span>;
		case 'NOT_FOUND':
			return <span>No document could be found with the specified ID</span>;
		default:
			console.log("WEIRD ERROR: " + e.code);
			return <span>{e.error}</span>;
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