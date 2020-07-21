import { AnyAction } from 'redux';
import { Cmd, loop, Loop } from 'redux-loop';
import undoable, { ActionCreators } from 'redux-undo';

import { Map } from 'immutable';

import * as Document from '../../io/document';
import * as Item from '../../io/document/item';

import * as DocumentReducer from '../../io/document/reducers';

// ACTIONS 

type UpdateFromServer = {
	type: "UpdateFromServer",
	data: {
		document: Document.Document
	}
}

export type Action = DocumentReducer.Action | UpdateFromServer;

// REDUCERS

function updateFromServer(document: Document.Document | null, action: UpdateFromServer): Document.Document | null {
	if (!document)
		return null;

	return {
		...action.data.document,
		focusedItemID: document.focusedItemID
	};
}

const skipHistoryFor: string[] = ["CopyItem", "CopySelection", "InitializeDocument", "UpdateItemIDs", "UpdateCursor"];

function undoableReducer(document: Document.Document | null | undefined, anyAction: AnyAction): Document.Document | null {
	const doc = document || null;
	const action = anyAction as Action;

	switch (action.type) {
		case "UpdateFromServer":
			return updateFromServer(doc, action);
		default:
			return DocumentReducer.reducer(doc, action);
	}
}

export const reducer = undoable(undoableReducer, {
	ignoreInitialState: true,
	filter: (action, curr, prev) => !curr ? true :
		!skipHistoryFor.includes(action.type)
		&& !(action.type == "UpdateItem" && skipHistoryFor.includes((action as any)?.data?.action?.type))
		&& !Document.equals(curr, prev._latestUnfiltered)
});

// DISPATCH PROPERTIES

type Dispatch = (action: Action) => void;

const documentCreators = (dispatch: Dispatch) => ({
	addItemToParent: (parent: Item.Item) => dispatch({
		type: "AddItemToParent",
		data: { parent }
	}),
	addItemAfterSibling: (sibling: Item.Item, focusOnNew: boolean) => dispatch({
		type: "AddItemAfterSibling",
		data: { sibling, focusOnNew }
	}),
	toggleItemCollapse: (item: Item.Item) => dispatch({
		type: "ToggleItemCollapse",
		data: { item }
	}),
	initializeDocument: (document: Document.Document | null) => dispatch({
		type: "InitializeDocument",
		data: { document }
	}),
	removeItem: (item: Item.Item) => dispatch({
		type: "RemoveItem",
		data: { item }
	}),
	setFocus: (item: Item.Item | undefined) => dispatch({
		type: "SetFocus",
		data: { item }
	}),
	incrementFocus: (createNewItem: boolean) => dispatch({
		type: "IncrementFocus",
		data: { createNewItem }
	}),
	decrementFocus: () => dispatch({
		type: "DecrementFocus",
		data: {}
	}),
	indentItem: (item: Item.Item) => dispatch({
		type: "IndentItem",
		data: { item }
	}),
	unindentItem: (item: Item.Item) => dispatch({
		type: "UnindentItem",
		data: { item }
	}),
	makeHeader: (item: Item.Item) => dispatch({
		type: "MakeHeader",
		data: { item }
	}),
	makeItem: (item: Item.Item) => dispatch({
		type: "MakeItem",
		data: { item }
	}),
	multiSelect: (item: Item.Item | undefined) => dispatch({
		type: "MultiSelect",
		data: { item }
	}),
	makeSelectionItem: () => dispatch({
		type: "MakeSelectionItem",
		data: {}
	}),
	makeSelectionHeader: () => dispatch({
		type: "MakeSelectionHeader",
		data: {}
	}),
	removeSelection: () => dispatch({
		type: "RemoveSelection",
		data: {}
	}),
	indentSelection: () => dispatch({
		type: "IndentSelection",
		data: {}
	}),
	unindentSelection: () => dispatch({
		type: "UnindentSelection",
		data: {}
	}),
	addTableOfContents: () => dispatch({
		type: "AddTableOfContents",
		data: {}
	}),
	refreshTableOfContents: () => dispatch({
		type: "RefreshTableOfContents",
		data: {}
	}),
	paste: (item: Item.Item, clipboard: Document.Document) => dispatch({
		type: "Paste",
		data: { item, clipboard }
	}),
	updateItemIDs: (newIDs: Map<Item.ItemID, Item.ItemID>) => dispatch({
		type: "UpdateItemIDs",
		data: { newIDs }
	}),
	markUnsaved: () => dispatch({
		type: "MarkUnsaved",
		data: {}
	}),
	updateFromServer: (document: Document.Document) => dispatch({
		type: "UpdateFromServer",
		data: { document }
	})
});

export const creators = (dispatch: (action: AnyAction) => void): DispatchProps => ({
	...documentCreators(dispatch),
	undo: () => dispatch(ActionCreators.undo()),
	redo: () => dispatch(ActionCreators.redo()),
});

export type DispatchProps = {
	addItemToParent: (parent: Item.Item) => void,
	addItemAfterSibling: (parent: Item.Item, focusOnNew: boolean) => void,
	toggleItemCollapse: (item: Item.Item) => void,
	initializeDocument: (document: Document.Document | null) => void,
	removeItem: (item: Item.Item) => void,
	setFocus: (item: Item.Item | undefined) => void,
	incrementFocus: (createNewData: boolean) => void,
	decrementFocus: () => void,
	indentItem: (item: Item.Item) => void,
	unindentItem: (item: Item.Item) => void,
	makeHeader: (item: Item.Item) => void,
	makeItem: (item: Item.Item) => void,
	multiSelect: (item: Item.Item | undefined) => void,
	makeSelectionItem: () => void,
	makeSelectionHeader: () => void,
	removeSelection: () => void,
	indentSelection: () => void,
	unindentSelection: () => void,
	addTableOfContents: () => void,
	refreshTableOfContents: () => void,
	paste: (item: Item.Item, clipboard: Document.Document) => void,
	updateItemIDs: (newIDs: Map<Item.ItemID, Item.ItemID>) => void,
	markUnsaved: () => void,
	updateFromServer: (document: Document.Document) => void,
	undo: () => void,
	redo: () => void
}