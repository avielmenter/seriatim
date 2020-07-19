import { AnyAction } from 'redux';
import { List } from 'immutable';

import { Error } from '../../network/error';

// ACTION TYPES

type AddError = {
	type: "AddError",
	data: {
		error: Error
	}
}

type RemoveError = {
	type: "RemoveError",
	data: {
		index: number
	}
}

type ClearErrors = {
	type: "ClearErrors",
	data: {}
}

export type Action
	= AddError
	| RemoveError
	| ClearErrors

// REDUCERS

function addError(errors: List<Error>, action: AddError): List<Error> {
	return errors.push(action.data.error);
}

function removeError(errors: List<Error>, action: RemoveError): List<Error> {
	return errors.remove(action.data.index);
}

function clearErrors(errors: List<Error>, action: ClearErrors): List<Error> {
	return errors.clear();
}

export function reducer(errors: List<Error> | undefined, anyAction: AnyAction): List<Error> {
	if (!errors)
		return List<Error>();

	const action = anyAction as Action;

	switch (action.type) {
		case "AddError":
			return addError(errors, action);
		case "RemoveError":
			return removeError(errors, action);
		case "ClearErrors":
			return clearErrors(errors, action);
		default:
			return errors;
	}
}

// DISPATCH PROPERTIES

type Dispatch = (action: AnyAction) => void;

export const creators = (dispatch: Dispatch) => ({
	addError: (error: Error) => dispatch({
		type: "AddError",
		data: { error }
	}),
	removeError: (index: number) => dispatch({
		type: "RemoveError",
		data: { index }
	}),
	clearErrors: () => dispatch({
		type: "ClearErrors",
		data: {}
	})
});

export type DispatchProps = {
	addError: (error: Error) => void,
	removeError: (index: number) => void,
	clearErrors: () => void
}
