import { ActionCreator, AnyAction, combineReducers } from 'redux';
import undoable, { ActionCreators, groupByActionTypes, StateWithHistory } from 'redux-undo';

import { List, Map, Range } from 'immutable';

import * as Item from '../data/item';
import * as Document from '../data/document';

import * as ItemReducers from './item';

// ACTION TYPES

type AddItemToParent = {
	type: "AddItemToParent",
	data: {
		parent: Item.Item
	}
}

type AddItemAfterSibling = {
	type: "AddItemAfterSibling",
	data: {
		sibling: Item.Item,
		focusOnNew: boolean
	}
}

type InitializeDocument = {
	type: "InitializeDocument",
	data: {
		document: Document.Document | null
	}
}

type ToggleItemCollapse = {
	type: "ToggleItemCollapse",
	data: {
		item: Item.Item
	}
}

type RemoveItem = {
	type: "RemoveItem",
	data: {
		item: Item.Item
	}
}

type SetFocus = {
	type: "SetFocus",
	data: {
		item: Item.Item | undefined
	}
}

type IncrementFocus = {
	type: "IncrementFocus",
	data: {
		createNewItem: boolean
	}
}

type DecrementFocus = {
	type: "DecrementFocus",
	data: {}
}

type IndentItem = {
	type: "IndentItem",
	data: {
		item: Item.Item
	}
}

type UnindentItem = {
	type: "UnindentItem",
	data: {
		item: Item.Item
	}
}

type MakeHeader = {
	type: "MakeHeader",
	data: {
		item: Item.Item
	}
}

type MakeItem = {
	type: "MakeItem",
	data: {
		item: Item.Item
	}
}

type CopyItem = {
	type: "CopyItem",
	data: {
		item: Item.Item | undefined
	}
}

type MultiSelect = {
	type: "MultiSelect",
	data: {
		item: Item.Item | undefined
	}
}

type MakeSelectionItem = {
	type: "MakeSelectionItem",
	data: {}
}

type MakeSelectionHeader = {
	type: "MakeSelectionHeader",
	data: {}
}

type RemoveSelection = {
	type: "RemoveSelection",
	data: {}
}

type IndentSelection = {
	type: "IndentSelection",
	data: {}
}

type UnindentSelection = {
	type: "UnindentSelection",
	data: {}
}

type AddTableOfContents = {
	type: "AddTableOfContents",
	data: {}
}

type CopySelection = {
	type: "CopySelection",
	data: {}
}

type Paste = {
	type: "Paste",
	data: {
		item: Item.Item
	}
}

type UpdateItem = {
	type: "UpdateItem",
	data: {
		item: Item.Item,
		action: ItemReducers.Action
	}
}

type UpdateSelection = {
	type: "UpdateSelection",
	data: {
		action: ItemReducers.Action
	}
}

type UpdateItemIDs = {
	type: "UpdateItemIDs",
	data: {
		newIDs: Map<Item.ItemID, Item.ItemID>
	}
}

type MarkSaved = {
	type: "MarkSaved",
	data: {}
}

type MarkUnsaved = {
	type: "MarkUnsaved",
	data: {}
}

export type Action
	= AddItemToParent
	| AddItemAfterSibling
	| InitializeDocument
	| ToggleItemCollapse
	| RemoveItem
	| SetFocus
	| IncrementFocus
	| DecrementFocus
	| IndentItem
	| UnindentItem
	| MakeHeader
	| MakeItem
	| CopyItem
	| Paste
	| MakeSelectionItem
	| MakeSelectionHeader
	| RemoveSelection
	| IndentSelection
	| UnindentSelection
	| AddTableOfContents
	| CopySelection
	| MultiSelect
	| UpdateItem
	| UpdateSelection
	| UpdateItemIDs
	| MarkSaved
	| MarkUnsaved;

// REDUCERS

function addItemToParent(document: Document.Document | null, action: AddItemToParent): Document.Document | null {
	if (!document)
		return null;

	return {
		...Document.addItem(document, action.data.parent),
		editedSinceSave: true
	};
}

function addItemAfterSibling(document: Document.Document | null, action: AddItemAfterSibling): Document.Document | null {
	if (!document)
		return null;

	const { sibling, focusOnNew } = action.data;
	const parent = document.items.get(sibling.parentID);
	if (!parent)
		return document;

	const indexOfSibling = parent.children.findIndex(sid => sid == sibling.itemID);
	if (indexOfSibling == -1)
		return document;

	const item = Item.newItemFromParent(parent);
	const newDocument = {
		...Document.addItem(document, parent, indexOfSibling + 1, item),
		editedSinceSave: true
	};

	return focusOnNew ?
		setFocus(newDocument, { type: "SetFocus", data: { item } }) :
		newDocument;
}

function toggleItemCollapse(document: Document.Document | null, action: ToggleItemCollapse): Document.Document | null {
	if (!document)
		return null;

	const item = action.data.item;
	if (item.children.count() <= 0)
		return document;

	return Document.updateItems(document, {
		...item,
		view: {
			...item.view,
			collapsed: !item.view.collapsed
		}
	});
}

function removeItem(document: Document.Document | null, action: RemoveItem): Document.Document | null {
	if (!document)
		return null;
	else if (!document.items.get(action.data.item.itemID) || action.data.item.itemID == document.rootItemID)
		return document;

	const item = action.data.item;
	const nextItem = Document.getNextItem(document, item);
	const prevSibling = Document.getPrevSibling(document, item);

	const children = item.children
		.flatMap(childID => {
			const child = document.items.get(childID);
			return child ? [child] : []
		});

	let newDocument = { ...document, editedSinceSave: true };

	if (prevSibling) {
		newDocument = children.reduce((prev, curr) => {
			const newParent = prev.items.get(prevSibling.itemID);
			if (!newParent)
				return prev;

			return Document.moveItem(prev, newParent, Infinity, curr).document
		}, newDocument);
	} else {
		newDocument = children.reverse().reduce((prev, curr) => Document.unindentItem(prev, curr).document, newDocument);
	}

	newDocument = Document.removeItem(newDocument, item, false);
	if (item.itemID == newDocument.tableOfContentsItemID)
		newDocument.tableOfContentsItemID = undefined;

	return (newDocument.focusedItemID == item.itemID) ? setFocus(newDocument, { type: "SetFocus", data: { item: nextItem } }) : newDocument;
}

function setFocus(document: Document.Document | null, action: SetFocus): Document.Document | null {
	if (!document)
		return null;

	const item = action.data.item;

	return {
		...document,
		focusedItemID: (item == undefined ? undefined : item.itemID)
	};
}

function incrementFocus(document: Document.Document | null, action: IncrementFocus): Document.Document | null {
	if (!document)
		return null;

	const focusedItem = document.items.get(document.focusedItemID || "");
	if (!focusedItem)
		return setFocus(document, { type: "SetFocus", data: { item: document.items.get(document.rootItemID) } });

	const { createNewItem } = action.data;
	const focusedParent = focusedItem.itemID == document.rootItemID ?
		{ ...focusedItem } :
		(document.items.get(focusedItem.parentID) || { ...focusedItem });

	const nextItem = Document.getNextItem(document, focusedItem, true);
	if (nextItem != undefined) {
		return setFocus(document, { type: "SetFocus", data: { item: nextItem } });
	} else if (!createNewItem) {
		return setFocus(document, { type: "SetFocus", data: { item: undefined } });
	}

	const newItem = Item.newItemFromParent(focusedParent);
	const newDocument = Document.addItem(document, focusedParent, focusedParent.children.count(), newItem);

	return setFocus(newDocument, {
		type: "SetFocus", data: {
			item: newItem
		}
	});
}

function decrementFocus(document: Document.Document | null, action: DecrementFocus): Document.Document | null {
	if (!document)
		return null;

	const focusedItem = Document.getFocusedItem(document);
	if (!focusedItem)
		return setFocus(document, { type: "SetFocus", data: { item: Document.getLastItem(document, document.items.get(document.rootItemID), true) } });

	if (focusedItem.itemID == document.rootItemID)
		return setFocus(document, { type: "SetFocus", data: { item: undefined } });

	const prevItem = Document.getPrevItem(document, focusedItem, true);
	return setFocus(document, { type: "SetFocus", data: { item: prevItem } });
}

function indentItem(document: Document.Document | null, action: IndentItem): Document.Document | null {
	if (!document)
		return null;

	const item = action.data.item;
	const parent = document.items.get(item.parentID);
	if (!parent)
		return document;

	const indentation = Document.indentItem(document, item);
	let newDocument = { ...indentation.document, editedSinceSave: true };
	const indented = indentation.moved;

	const indentedParent = newDocument.items.get(item.parentID);
	if (indentedParent && indentedParent.itemID == item.parentID)
		return indentItem(newDocument, { type: "IndentItem", data: { item: indentedParent } });
	return newDocument;
}

function unindentItem(document: Document.Document | null, action: UnindentItem): Document.Document | null {
	if (!document)
		return null;

	const item = action.data.item;
	if (!item)
		return document;

	const indentation = Document.unindentItem(document, item);
	let newDocument = indentation.document;
	const indented = indentation.moved;

	if (indented.parentID == item.parentID) {
		const nextItem = Document.getNextItem(document, indented);
		if (nextItem)
			return unindentItem(newDocument, { type: "UnindentItem", data: { item: nextItem } });
	}

	return {
		...newDocument,
		editedSinceSave: true
	};
}

function makeHeader(document: Document.Document | null, action: MakeHeader): Document.Document | null {
	if (!document)
		return null;

	const item = action.data.item;

	if (item.itemID == document.rootItemID)
		return document;

	function getPreviousHeaderLevel(doc: Document.Document, curr: Item.Item | undefined): number {
		if (!curr || !curr.parentID || curr.itemID == doc.rootItemID)
			return 0;

		const hashes = curr.text.match(/(#+)\s+.*/);
		if (!hashes || hashes.length < 2)
			return getPreviousHeaderLevel(doc, doc.items.get(curr.parentID));

		return hashes[1].length;
	}

	const numHashes = getPreviousHeaderLevel(document, document.items.get(item.parentID)) + 1;
	const hashes = Range(0, numHashes).reduce((prev, i) => prev + '#', '');

	const newItem: Item.Item = {
		...item,
		text: item.text.replace(/^(#+\s)?/, hashes + ' '),
		view: {
			...item.view,
		}
	};

	return Document.updateItems({ ...document, editedSinceSave: true }, newItem);
}

function makeItem(document: Document.Document | null, action: MakeItem): Document.Document | null {
	if (!document)
		return null;

	const item = action.data.item;

	if (item.itemID == document.rootItemID)
		return document;

	const newItem: Item.Item = {
		...item,
		text: item.text.replace(/^(#+\s)?/, ''),
		view: {
			...item.view,
		}
	};

	return Document.updateItems({ ...document, editedSinceSave: true }, newItem);
}

function copyItem(document: Document.Document | null, action: CopyItem): Document.Document | null {
	if (!document)
		return null;

	const item = action.data.item;

	if (!item) {
		return {
			...document,
			clipboard: undefined
		}
	}

	return {
		...document,
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
			clipboard: undefined
		}
	};
}

function copySelection(document: Document.Document | null, action: CopySelection): Document.Document | null {
	if (!document)
		return null;
	if (!document.selection) {
		return {
			...document,
			clipboard: undefined
		};
	}

	const selectedItems = Document.getSelectedItems(document);

	const selectionRoot = Document.getSelectionParent(document);
	if (!selectionRoot) {
		return {
			...document,
			clipboard: undefined
		};
	}

	const selectionSubtree = Document.copySubtree(document, selectionRoot);

	return {
		...document,
		clipboard: {
			...document,
			rootItemID: selectionRoot.itemID,
			items: selectionSubtree,
			selection: { ...document.selection },
			clipboard: undefined
		}
	};
}

function makeSelectionItem(document: Document.Document | null, action: MakeSelectionItem): Document.Document | null {
	if (!document)
		return null;

	return Document.getSelectionRange(document)
		.reduce((prev: Document.Document | null, selected) => makeItem(prev, { type: "MakeItem", data: { item: selected } }), { ...document, editedSinceSave: true });
}

function makeSelectionHeader(document: Document.Document | null, action: MakeSelectionHeader): Document.Document | null {
	if (!document)
		return null;

	return Document.getSelectionRange(document)
		.reduce((prev: Document.Document | null, selected) => makeHeader(prev, { type: "MakeHeader", data: { item: selected } }), { ...document, editedSinceSave: true });
}

function removeSelection(document: Document.Document | null, action: RemoveSelection): Document.Document | null {
	if (!document)
		return null;

	const selectionRange = Document.getSelectionRange(document);
	const newDocument = selectionRange.reduce((prev: Document.Document | null, selected) => {
		const item = !prev ? undefined : prev.items.get(selected.itemID);

		if (!prev)
			return null;
		else if (item)
			return removeItem(prev, { type: "RemoveItem", data: { item } });
		else
			return prev;
	}, document);

	return !newDocument ? null : {
		...newDocument,
		selection: undefined
	}
}

function indentSelection(document: Document.Document | null, action: IndentSelection): Document.Document | null {
	if (!document)
		return null;

	const selectionRange = Document.getSelectionRange(document);
	const selectedItems = Document.getSelectedItems(document);

	let itemsToIndent = List<Item.Item>();

	for (let curr: Item.Item | undefined = selectionRange.get(0); curr != undefined && selectedItems.has(curr.itemID);) {
		itemsToIndent = itemsToIndent.push(curr);

		let next = Document.getNextSibling(document, curr);

		while (!next) {
			const nextParent = Document.getParent(document, curr);

			if (!nextParent) {
				curr = undefined;
				break;
			}

			curr = nextParent;
			next = Document.getNextSibling(document, curr);
		}

		curr = next;
	}

	return {
		...itemsToIndent.reduce((prev, curr) => Document.indentItem(prev, prev.items.get(curr.itemID) || curr).document, document),
		editedSinceSave: true
	};
}

function unindentSelection(document: Document.Document | null, action: UnindentSelection): Document.Document | null {
	if (!document)
		return null;

	const selectionRange = Document.getSelectionRange(document);
	const selectedItems = Document.getSelectedItems(document);

	let itemsToUnindent = List<Item.Item>();

	for (let curr: Item.Item | undefined = selectionRange.get(0); curr != undefined && selectedItems.has(curr.itemID);) {
		itemsToUnindent = itemsToUnindent.push(curr);

		let next = Document.getNextSibling(document, curr);

		while (!next) {
			const nextParent = Document.getParent(document, curr);

			if (!nextParent) {
				curr = undefined;
				break;
			}

			curr = nextParent;
			next = Document.getNextSibling(document, curr);
		}

		curr = next;
	}

	return {
		...itemsToUnindent.reduce((prev, curr) => Document.unindentItem(prev, prev.items.get(curr.itemID) || curr).document, document),
		editedSinceSave: true
	};
}

function addTableOfContents(document: Document.Document | null, action: AddTableOfContents): Document.Document | null {
	if (!document)
		return null;

	const rootItem = document.items.get(document.rootItemID);
	if (!rootItem)
		return document;

	const text = Document.getTableOfContentsText(document);
	const item = Item.newItemFromParent(rootItem);
	if (!item)
		return null;

	return {
		...Document.addItem(document, rootItem, 0, {
			...Item.changeStyle(item, { property: "lineHeight", value: 2, unit: "em" }),
			text
		}),
		tableOfContentsItemID: item.itemID,
		editedSinceSave: true
	};
}

function paste(document: Document.Document | null, action: Paste): Document.Document | null {
	if (!document)
		return null;
	if (!document.clipboard || !document.clipboard.selection)
		return document;

	let newDocument = document;

	let clipboard = Document.regenerateIDs(document.clipboard);
	let inSelection = false;

	const selectedItems = Document.getSelectedItems(clipboard);
	const selection = clipboard.selection;

	const item = action.data.item;

	const addToParent = (item.children.count() > 0 && !item.view.collapsed) || item.itemID == document.rootItemID;
	const pasteBelow = !addToParent ? item : Item.newItemFromParent(item);
	if (!pasteBelow)
		return document;

	if (addToParent)
		newDocument = Document.addItem(newDocument, item, 0, pasteBelow);

	let prevDoc: Item.Item | undefined = pasteBelow;
	let prevSel: Item.Item | undefined = undefined;

	for (let curr: Item.Item | undefined = clipboard.items.get(clipboard.rootItemID); curr != undefined; curr = Document.getNextItem(clipboard, curr)) {
		if (!curr || !prevDoc || !selection)
			break;

		if (curr.itemID == selection.start || curr.itemID == selection.end)
			inSelection = !inSelection;
		if (!inSelection && curr.itemID != selection.start && curr.itemID != selection.end)
			continue;

		let newItem = curr;

		if (!prevSel || prevSel.itemID != curr.parentID) {
			const prevParent = newDocument.items.get(prevDoc.parentID);
			if (!prevParent)
				continue;

			const prevIndex = prevParent.children.indexOf(prevDoc.itemID);

			newItem = { ...curr, parentID: prevParent.itemID, children: List<Item.ItemID>() };
			newDocument = Document.addItem(newDocument, prevParent, prevIndex + 1, newItem);
		} else {
			newItem = { ...curr, parentID: prevDoc.itemID, children: List<Item.ItemID>() };
			newDocument = Document.addItem(newDocument, prevDoc, 0, newItem);
		}

		prevSel = curr;
		prevDoc = newItem;
	}

	if (addToParent)
		newDocument = Document.removeItem(document, pasteBelow);

	return {
		...newDocument,
		editedSinceSave: true
	};
}

function multiSelect(document: Document.Document | null, action: MultiSelect): Document.Document | null {
	if (!document)
		return null;

	const item = action.data.item;
	if (item == undefined)
		return {
			...document,
			selection: undefined
		}

	if (document.selection != undefined &&
		(document.selection.start == item.itemID || document.selection.end == item.itemID))
		return {
			...document,
			selection: undefined
		};

	if (!document.selection)
		return {
			...document,
			selection: {
				start: document.focusedItemID || item.itemID,
				end: item.itemID
			}
		};

	return {
		...document,
		editedSinceSave: false,
		selection: {
			...document.selection,
			end: item.itemID
		}
	};
}

function initializeDocument(document: Document.Document | null, action: InitializeDocument): Document.Document | null {
	if (action.data.document)
		return action.data.document;
	return Document.getEmptyDocument();
}

function updateItemIDs(document: Document.Document | null, action: UpdateItemIDs): Document.Document | null {
	if (!document)
		return document;

	return {
		...Document.updateItemIDs(document, action.data.newIDs),
		editedSinceSave: false
	};
}

function updateItem(document: Document.Document | null, action: UpdateItem): Document.Document | null {
	if (!document)
		return document;

	const itemAction = action.data.action;

	const itemInDocument = document.items.get(action.data.item.itemID);
	if (!itemInDocument)
		return document;

	const updatedItem = ItemReducers.reducer(itemInDocument, itemAction);
	if (updatedItem === undefined)
		return document;

	const title = updatedItem.itemID == document.rootItemID ? updatedItem.text : document.title;

	return {
		...Document.updateItems(document, updatedItem),
		title,
		editedSinceSave: updatedItem.text == action.data.item.text ? document.editedSinceSave : true
	}
}

function updateSelection(document: Document.Document | null, action: UpdateSelection): Document.Document | null {
	if (!document || !document.selection)
		return document;

	const selection = Document.getSelectionRange(document);
	const focused = !document.focusedItemID ? undefined : Document.getFocusedItem(document);

	const unfocusedDocument = !focused ? document : {
		...Document.updateItems(document, { ...focused, view: { ...focused.view, cursorPosition: undefined } }),
		focusedItemID: undefined
	}

	return selection.reduce((prev: Document.Document | null, curr) => prev && updateItem(prev, {
		type: "UpdateItem",
		data: {
			item: curr,
			action: action.data.action
		}
	}), unfocusedDocument);
}

function markSaved(document: Document.Document | null, action: MarkSaved): Document.Document | null {
	return !document
		? null
		: { ...document, editedSinceSave: false };
}

function markUnsaved(document: Document.Document | null, action: MarkUnsaved): Document.Document | null {
	return !document
		? null
		: { ...document, editedSinceSave: true };
}

function undoableReducer(document: Document.Document | undefined | null, anyAction: AnyAction): Document.Document | null {
	const action = anyAction as Action;
	const doc = document || null;

	switch (action.type) {
		case "AddItemToParent":
			return addItemToParent(doc, action);
		case "InitializeDocument":
			return initializeDocument(doc, action);
		case "AddItemAfterSibling":
			return addItemAfterSibling(doc, action);
		case "ToggleItemCollapse":
			return toggleItemCollapse(doc, action);
		case "RemoveItem":
			return removeItem(doc, action);
		case "SetFocus":
			return setFocus(doc, action);
		case "IncrementFocus":
			return incrementFocus(doc, action);
		case "DecrementFocus":
			return decrementFocus(doc, action);
		case "IndentItem":
			return indentItem(doc, action);
		case "UnindentItem":
			return unindentItem(doc, action);
		case "MakeHeader":
			return makeHeader(doc, action);
		case "MakeItem":
			return makeItem(doc, action);
		case "CopyItem":
			return copyItem(doc, action);
		case "MultiSelect":
			return multiSelect(doc, action);
		case "MakeSelectionItem":
			return makeSelectionItem(doc, action);
		case "MakeSelectionHeader":
			return makeSelectionHeader(doc, action);
		case "RemoveSelection":
			return removeSelection(doc, action);
		case "IndentSelection":
			return indentSelection(doc, action);
		case "UnindentSelection":
			return unindentSelection(doc, action);
		case "AddTableOfContents":
			return addTableOfContents(doc, action);
		case "CopySelection":
			return copySelection(doc, action);
		case "Paste":
			return paste(doc, action);
		case "UpdateItemIDs":
			return updateItemIDs(doc, action);
		case "UpdateItem":
			return updateItem(doc, action);
		case "UpdateSelection":
			return updateSelection(doc, action);
		case "MarkSaved":
			return markSaved(doc, action);
		case "MarkUnsaved":
			return markUnsaved(doc, action);
		default:
			return doc;
	}
}

const skipHistoryFor: string[] = ["CopyItem", "CopySelection", "InitializeDocument", "UpdateItemIDs", "UpdateCursor"];

export const reducer = undoable(undoableReducer, {
	ignoreInitialState: true,
	filter: (action, curr, prev) => !curr ? true :
		!skipHistoryFor.includes(action.type)
		&& !(action.type == "UpdateItem" && skipHistoryFor.includes((action as UpdateItem).data.action.type))
		&& !Document.equals(curr, prev._latestUnfiltered)
});

// DISPATCH PROPERTIES

type Dispatch = (action: AnyAction) => void;

export const creators = (dispatch: Dispatch) => ({
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
	copyItem: (item: Item.Item | undefined) => dispatch({
		type: "CopyItem",
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
	copySelection: () => dispatch({
		type: "CopySelection",
		data: {}
	}),
	paste: (item: Item.Item) => dispatch({
		type: "Paste",
		data: { item }
	}),
	updateItemIDs: (newIDs: Map<Item.ItemID, Item.ItemID>) => dispatch({
		type: "UpdateItemIDs",
		data: { newIDs }
	}),
	markUnsaved: () => dispatch({
		type: "MarkUnsaved",
		data: {}
	}),
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
	copyItem: (item: Item.Item | undefined) => void,
	multiSelect: (item: Item.Item | undefined) => void,
	makeSelectionItem: () => void,
	makeSelectionHeader: () => void,
	removeSelection: () => void,
	indentSelection: () => void,
	unindentSelection: () => void,
	addTableOfContents: () => void,
	copySelection: () => void,
	paste: (item: Item.Item) => void,
	updateItemIDs: (newIDs: Map<Item.ItemID, Item.ItemID>) => void,
	markUnsaved: () => void,
	undo: () => void,
	redo: () => void
}