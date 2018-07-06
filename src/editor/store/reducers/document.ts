import { ActionCreator, AnyAction } from 'redux';
import undoable, { ActionCreators } from 'redux-undo';
import { List, Map, Range } from 'immutable';

import * as Item from '../data/item';
import * as Document from '../data/document';

import * as Store from '../';

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
		document: Document.Document | undefined
	}
}

type ToggleItemCollapse = {
	type: "ToggleItemCollapse",
	data: {
		item: Item.Item
	}
}

type UpdateItemText = {
	type: "UpdateItemText",
	data: {
		item: Item.Item,
		newText: string
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

type LoadDocument = {
	type: "LoadDocument",
	data: {
		document: Document.Document
	}
}

type UpdateItemIDs = {
	type: "UpdateItemIDs",
	data: {
		newIDs: Map<Item.ItemID, Item.ItemID>
	}
}

export type Action = AddItemToParent |
	AddItemAfterSibling |
	InitializeDocument |
	ToggleItemCollapse |
	RemoveItem |
	SetFocus |
	IncrementFocus |
	DecrementFocus |
	IndentItem |
	UnindentItem |
	UpdateItemText |
	MakeHeader |
	MakeItem |
	CopyItem |
	Paste |
	MakeSelectionItem |
	MakeSelectionHeader |
	RemoveSelection |
	IndentSelection |
	UnindentSelection |
	CopySelection |
	MultiSelect |
	LoadDocument |
	UpdateItemIDs;

// REDUCERS

function addItemToParent(document: Document.Document | undefined, action: AddItemToParent): Document.Document | undefined {
	if (!document)
		return undefined;

	return Document.addItem(document, action.data.parent);
}

function addItemAfterSibling(document: Document.Document | undefined, action: AddItemAfterSibling): Document.Document | undefined {
	if (!document)
		return undefined;

	const { sibling, focusOnNew } = action.data;
	const parent = document.items.get(sibling.parentID);
	if (!parent)
		return document;

	const indexOfSibling = parent.children.findIndex(sid => sid == sibling.itemID);
	if (indexOfSibling == -1)
		return document;

	const item = Item.newItemFromParent(parent);
	const newDocument = Document.addItem(document, parent, indexOfSibling + 1, item);

	return focusOnNew ?
		setFocus(newDocument, { type: "SetFocus", data: { item } }) :
		newDocument;
}

function toggleItemCollapse(document: Document.Document | undefined, action: ToggleItemCollapse): Document.Document | undefined {
	if (!document)
		return undefined;

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

function updateItemText(document: Document.Document | undefined, action: UpdateItemText): Document.Document | undefined {
	if (!document)
		return undefined;
	else if (!document.items.get(action.data.item.itemID))
		return document;

	const { item, newText } = action.data;

	const newType = (newText.match(/\s*#+\s+.*/) ? "Header" : "Item");

	const newItem = {
		...item,
		text: newText,
		view: {
			...item.view,
			itemType: (item.view.itemType == "Title" ? "Title" : newType) as Item.ItemType
		}
	};

	const newTitle = newItem.view.itemType == "Title" ? newItem.text : document.title;

	return Document.updateItems({
		...document,
		title: newTitle
	}, newItem);
}

function removeItem(document: Document.Document | undefined, action: RemoveItem): Document.Document | undefined {
	if (!document)
		return undefined;
	else if (!document.items.get(action.data.item.itemID) || action.data.item.itemID == document.rootItemID)
		return document;

	const item = action.data.item;
	const nextItem = Document.getNextItem(document, item);
	const prevSibling = Document.getPrevSibling(document, item);

	const children = item.children.map(childID => document.items.get(childID));

	let newDocument = document;

	if (prevSibling) {
		newDocument = children.reduce((prev, curr) => {
			const newParent = prev.items.get(prevSibling.itemID);
			return Document.moveItem(prev, newParent, Infinity, curr).document
		}, newDocument);
	} else {
		newDocument = children.reverse().reduce((prev, curr) => Document.unindentItem(prev, curr).document, newDocument);
	}

	newDocument = Document.removeItem(newDocument, item, false);
	return (newDocument.focusedItemID == item.itemID) ? setFocus(newDocument, { type: "SetFocus", data: { item: nextItem } }) : newDocument;
}

function setFocus(document: Document.Document | undefined, action: SetFocus): Document.Document | undefined {
	if (!document)
		return undefined;

	const item = action.data.item;

	return {
		...document,
		focusedItemID: (item == undefined ? undefined : item.itemID)
	};
}

function incrementFocus(document: Document.Document | undefined, action: IncrementFocus): Document.Document | undefined {
	if (!document)
		return undefined;
	if (!document.focusedItemID || !document.items.get(document.focusedItemID))
		return setFocus(document, { type: "SetFocus", data: { item: document.items.get(document.rootItemID) } });

	const { createNewItem } = action.data;
	const focusedItem = document.items.get(document.focusedItemID);
	const focusedParent = (focusedItem.itemID == document.rootItemID ? { ...focusedItem } : document.items.get(focusedItem.parentID));

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

function decrementFocus(document: Document.Document | undefined, action: DecrementFocus): Document.Document | undefined {
	if (!document)
		return undefined;
	if (!document.focusedItemID || !document.items.get(document.focusedItemID))
		return setFocus(document, { type: "SetFocus", data: { item: Document.getLastItem(document, document.items.get(document.rootItemID), true) } });

	const focusedItem = document.items.get(document.focusedItemID);
	if (focusedItem.itemID == document.rootItemID)
		return setFocus(document, { type: "SetFocus", data: { item: undefined } });

	const prevItem = Document.getPrevItem(document, focusedItem, true);
	return setFocus(document, { type: "SetFocus", data: { item: prevItem } });
}

function indentItem(document: Document.Document | undefined, action: IndentItem): Document.Document | undefined {
	if (!document)
		return undefined;

	const item = action.data.item;
	const parent = document.items.get(item.parentID);
	if (!parent)
		return document;

	const indentation = Document.indentItem(document, item);
	let newDocument = indentation.document;
	const indented = indentation.moved;

	if (indented.parentID == item.parentID)
		return indentItem(newDocument, { type: "IndentItem", data: { item: newDocument.items.get(item.parentID) } });
	return newDocument;
}

function unindentItem(document: Document.Document | undefined, action: UnindentItem): Document.Document | undefined {
	if (!document)
		return undefined;

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

	return newDocument;
}

function makeHeader(document: Document.Document | undefined, action: MakeHeader): Document.Document | undefined {
	if (!document)
		return undefined;

	const item = action.data.item;

	if (item.itemID == document.rootItemID)
		return document;

	function getPreviousHeaderLevel(doc: Document.Document, curr: Item.Item): number {
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
			itemType: "Header"
		}
	};

	return Document.updateItems(document, newItem);
}

function makeItem(document: Document.Document | undefined, action: MakeItem): Document.Document | undefined {
	if (!document)
		return undefined;

	const item = action.data.item;

	if (item.itemID == document.rootItemID)
		return document;

	const newItem: Item.Item = {
		...item,
		text: item.text.replace(/^(#+\s)?/, ''),
		view: {
			...item.view,
			itemType: "Item"
		}
	};

	return Document.updateItems(document, newItem);
}

function copyItem(document: Document.Document | undefined, action: CopyItem): Document.Document | undefined {
	if (!document)
		return undefined;

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
			items: Map<Item.ItemID, Item.Item>({
				[item.itemID]: item
			}),
			clipboard: undefined
		}
	};
}

function copySelection(document: Document.Document | undefined, action: CopySelection): Document.Document | undefined {
	if (!document)
		return undefined;
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

function makeSelectionItem(document: Document.Document | undefined, action: MakeSelectionItem): Document.Document | undefined {
	if (!document)
		return undefined;

	return Document.getSelectionRange(document)
		.reduce((prev: Document.Document | undefined, selected) => makeItem(prev, { type: "MakeItem", data: { item: selected } }), document)
}

function makeSelectionHeader(document: Document.Document | undefined, action: MakeSelectionHeader): Document.Document | undefined {
	if (!document)
		return undefined;

	return Document.getSelectionRange(document)
		.reduce((prev: Document.Document | undefined, selected) => makeHeader(prev, { type: "MakeHeader", data: { item: selected } }), document)
}

function removeSelection(document: Document.Document | undefined, action: RemoveSelection): Document.Document | undefined {
	if (!document)
		return undefined;

	const selectionRange = Document.getSelectionRange(document);
	const newDocument = selectionRange.reduce((prev: Document.Document | undefined, selected) => {
		if (!prev)
			return undefined;
		else if (prev.items.has(selected.itemID))
			return removeItem(prev, { type: "RemoveItem", data: { item: prev.items.get(selected.itemID) } });
		else
			return prev;
	}, document);

	return !newDocument ? undefined : {
		...newDocument,
		selection: undefined
	}
}

function indentSelection(document: Document.Document | undefined, action: IndentSelection): Document.Document | undefined {
	if (!document)
		return undefined;

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

	return itemsToIndent.reduce((prev, curr) => Document.indentItem(prev, prev.items.get(curr.itemID)).document, document);
}

function unindentSelection(document: Document.Document | undefined, action: UnindentSelection): Document.Document | undefined {
	if (!document)
		return undefined;

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

	return itemsToUnindent.reduce((prev, curr) => Document.unindentItem(prev, prev.items.get(curr.itemID)).document, document);
}

function paste(document: Document.Document | undefined, action: Paste): Document.Document | undefined {
	if (!document)
		return undefined;
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

	return newDocument;
}

function multiSelect(document: Document.Document | undefined, action: MultiSelect): Document.Document | undefined {
	if (!document)
		return undefined;

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
		selection: {
			...document.selection,
			end: item.itemID
		}
	};
}

function initializeDocument(document: Document.Document | undefined, action: InitializeDocument): Document.Document | undefined {
	if (action.data.document)
		return action.data.document;
	return Document.getEmptyDocument();
}

function loadDocument(document: Document.Document | undefined, action: LoadDocument): Document.Document | undefined {
	return action.data.document;
}

function updateItemIDs(document: Document.Document | undefined, action: UpdateItemIDs): Document.Document | undefined {
	if (!document)
		return document;

	return Document.updateItemIDs(document, action.data.newIDs);
}

export function reducer(doc: Document.Document | undefined, anyAction: AnyAction): Document.Document | undefined {
	const action = anyAction as Action;

	switch (action.type) {
		case "AddItemToParent":
			return addItemToParent(doc, action);
		case "InitializeDocument":
			return initializeDocument(doc, action);
		case "AddItemAfterSibling":
			return addItemAfterSibling(doc, action);
		case "ToggleItemCollapse":
			return toggleItemCollapse(doc, action);
		case "UpdateItemText":
			return updateItemText(doc, action);
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
		case "CopySelection":
			return copySelection(doc, action);
		case "Paste":
			return paste(doc, action);
		case "LoadDocument":
			return loadDocument(doc, action);
		case "UpdateItemIDs":
			return updateItemIDs(doc, action);
		default:
			return doc;
	}
}

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
	initializeDocument: (document: Document.Document | undefined) => dispatch({
		type: "InitializeDocument",
		data: { document }
	}),
	removeItem: (item: Item.Item) => dispatch({
		type: "RemoveItem",
		data: { item }
	}),
	updateItemText: (item: Item.Item, newText: string) => dispatch({
		type: "UpdateItemText",
		data: { item, newText }
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
	copySelection: () => dispatch({
		type: "CopySelection",
		data: {}
	}),
	paste: (item: Item.Item) => dispatch({
		type: "Paste",
		data: { item }
	}),
	loadDocument: (document: Document.Document) => dispatch({
		type: "LoadDocument",
		data: { document }
	}),
	updateItemIDs: (newIDs: Map<Item.ItemID, Item.ItemID>) => dispatch({
		type: "UpdateItemIDs",
		data: { newIDs }
	}),
	undo: () => dispatch(ActionCreators.undo()),
	redo: () => dispatch(ActionCreators.redo()),
});

export type DispatchProps = {
	addItemToParent: (parent: Item.Item) => void,
	addItemAfterSibling: (parent: Item.Item, focusOnNew: boolean) => void,
	toggleItemCollapse: (item: Item.Item) => void,
	initializeDocument: (document: Document.Document | undefined) => void,
	updateItemText: (item: Item.Item, newText: string) => void,
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
	copySelection: () => void,
	paste: (item: Item.Item) => void,
	loadDocument: (document: Document.Document) => void,
	updateItemIDs: (newIDs: Map<Item.ItemID, Item.ItemID>) => void,
	undo: () => void,
	redo: () => void
}

export const skipHistoryFor: string[] = ["CopyItem", "CopySelection", "SetFocus", "IncrementFocus", "DecrementFocus", "SetFocus", "LoadDocument", "InitializeDocument", "UpdateItemIDs"];