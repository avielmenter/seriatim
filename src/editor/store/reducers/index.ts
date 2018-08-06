import { AnyAction } from 'redux';
import { StateWithHistory } from 'redux-undo';

import { List } from 'immutable';

import { SeriatimSuccess, SeriatimError } from '../../network/server';

import * as Document from '../data/document';

import { ApplicationState } from '..';

// UTILITY

const newDocumentHistory = (init?: Document.Document): StateWithHistory<Document.Document | null> => ({
	_latestUnfiltered: init || null,
	group: null,
	limit: 1,
	index: 0,
	past: [],
	present: init || null,
	future: []
});

// ACTION TYPES

type StartSaving = {
	type: "StartSaving",
	data: {}
}

type StopSaving = {
	type: "StopSaving",
	data: {}
}

type LoadDocument = {
	type: "LoadDocument",
	data: {
		document: SeriatimSuccess<Document.Document>
	}
}

export type Action
	= LoadDocument
	| StartSaving
	| StopSaving;

// REDUCERS

function startSaving(state: ApplicationState, action: StartSaving): ApplicationState {
	return {
		...state,
		saving: true
	}
}

function stopSaving(state: ApplicationState, action: StopSaving): ApplicationState {
	return {
		...state,
		saving: false
	}
}

function loadDocument(state: ApplicationState, action: LoadDocument): ApplicationState {
	const defaultPermissions = {
		edit: false
	};

	const { data, permissions } = action.data.document;

	const initDocument = {
		...data,
		focusedItemID: (permissions !== undefined && permissions.edit) ? data.focusedItemID : undefined
	};

	return {
		...state,
		document: newDocumentHistory(initDocument),
		permissions: action.data.document.permissions || defaultPermissions
	}
}

export function reducer(state: ApplicationState | undefined, anyAction: AnyAction): ApplicationState {
	const action = anyAction as Action;

	const appState = state || {
		document: newDocumentHistory(),
		errors: List<SeriatimError>(),
		permissions: null,
		saving: false
	};

	switch (action.type) {
		case "LoadDocument":
			return loadDocument(appState, action);
		case "StartSaving":
			return startSaving(appState, action);
		case "StopSaving":
			return stopSaving(appState, action);
		default:
			return appState;
	}
}

// DISPATCH PROPERTIES

type Dispatch = (action: AnyAction) => void;

export const creators = (dispatch: Dispatch) => ({
	loadDocument: (document: SeriatimSuccess<Document.Document>) => dispatch({
		type: "LoadDocument",
		data: { document }
	}),
	startSaving: () => dispatch({
		type: "StartSaving",
		data: {}
	}),
	stopSaving: () => dispatch({
		type: "StopSaving",
		data: {}
	}),
})

export type DispatchProps = {

	loadDocument: (document: SeriatimSuccess<Document.Document>) => void,
	startSaving: () => void,
	stopSaving: () => void,
}