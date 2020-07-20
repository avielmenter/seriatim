import { AnyAction } from 'redux';
import { StateWithHistory } from 'redux-undo';

import { List, Map } from 'immutable';

import { SeriatimSuccess, SeriatimError } from '../../../server';

import * as Item from '../../io/document/item';
import * as Document from '../../io/document';

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

type CopyItem = {
	type: "CopyItem",
	data: {
		item: Item.Item | undefined
	}
}

type CopySelection = {
	type: "CopySelection",
	data: {}
}
export type Action
	= LoadDocument
	| StartSaving
	| StopSaving
	| CopyItem
	| CopySelection;

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

function copyItem(state: ApplicationState, action: CopyItem): ApplicationState {
	const document = state.document.present;

	if (!document)
		return state;

	const item = action.data.item;

	if (!item) {
		return {
			...state,
			clipboard: null
		}
	}

	return {
		...state,
		clipboard: {
			...document,
			rootItemID: item.itemID,
			selection: {
				start: item.itemID,
				end: item.itemID
			},
			items: Map<Item.ItemID, Item.Item>([
				[item.itemID, item]
			]),
		}
	};
}

function copySelection(state: ApplicationState, action: CopySelection): ApplicationState {
	const document = state.document.present;

	if (!document)
		return state;
	if (!document.selection) {
		return {
			...state,
			clipboard: null
		};
	}

	const selectedItems = Document.getSelectedItems(document);

	const selectionRoot = Document.getSelectionParent(document);
	if (!selectionRoot) {
		return {
			...state,
			clipboard: null
		};
	}

	const selectionSubtree = Document.copySubtree(document, selectionRoot);

	return {
		...state,
		clipboard: {
			...document,
			rootItemID: selectionRoot.itemID,
			items: selectionSubtree,
			selection: { ...document.selection }
		}
	};
}

export function reducer(state: ApplicationState | undefined, anyAction: AnyAction): ApplicationState {
	const action = anyAction as Action;

	const appState = state || {
		document: newDocumentHistory(),
		errors: List<SeriatimError>(),
		permissions: null,
		clipboard: null,
		saving: false
	};

	switch (action.type) {
		case "LoadDocument":
			return loadDocument(appState, action);
		case "StartSaving":
			return startSaving(appState, action);
		case "StopSaving":
			return stopSaving(appState, action);
		case "CopyItem":
			return copyItem(appState, action);
		case "CopySelection":
			return copySelection(appState, action);
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
	copyItem: (item: Item.Item | undefined) => dispatch({
		type: "CopyItem",
		data: { item }
	}),
	copySelection: () => dispatch({
		type: "CopySelection",
		data: {}
	})
})

export type DispatchProps = {
	loadDocument: (document: SeriatimSuccess<Document.Document>) => void,
	startSaving: () => void,
	stopSaving: () => void,
	copyItem: (item: Item.Item | undefined) => void,
	copySelection: () => void
}