import { ActionCreator, AnyAction } from 'redux';
import undoable, { ActionCreators } from 'redux-undo';
import { List, Map } from 'immutable';

import * as Item from '../data/item';
import Document, * as Doc from '../data/document';

import * as Store from '../';

// ACTION TYPES

type AddItemToParent = {
	type : "AddItemToParent",
	data : {
		parent : Item.Item
	}
}

type AddItemAfterSibling = {
	type : "AddItemAfterSibling",
	data : {
		sibling : Item.Item,
		focusOnNew : boolean
	}
}

type InitializeDocument = {
	type : "InitializeDocument",
	data : {
		document: Document | undefined
	}
}

type ToggleItemCollapse = {
	type : "ToggleItemCollapse",
	data : {
		item: Item.Item
	}
}

type UpdateItemText = {
	type : "UpdateItemText",
	data : {
		item: Item.Item,
		newText: string
	}
}

type RemoveItem = {
	type : "RemoveItem",
	data : {
		item: Item.Item
	}
}

type SetFocus = {
	type : "SetFocus",
	data : {
		item: Item.Item | undefined
	}
}

type IncrementFocus = {
	type : "IncrementFocus",
	data : {
		createNewItem : boolean
	}
}

type DecrementFocus = {
	type : "DecrementFocus",
	data : { }
}

type IndentItem = {
	type : "IndentItem",
	data : {
		item : Item.Item
	}
}

type UnindentItem = {
	type : "UnindentItem",
	data : {
		item : Item.Item
	}
}

type MakeHeader = {
	type : "MakeHeader",
	data : {
		item : Item.Item
	}
}

type MakeItem = {
	type : "MakeItem",
	data : {
		item : Item.Item
	}
}

type CopyItem = {
	type : "CopyItem",
	data : {
		item : Item.Item
	}
}

type MultiSelect = {
	type : "MultiSelect",
	data : {
		item : Item.Item | undefined
	}
}

type MakeSelectionItem = {
	type : "MakeSelectionItem",
	data: { }
}

type MakeSelectionHeader = {
	type : "MakeSelectionHeader",
	data : { }
}

type RemoveSelection = {
	type : "RemoveSelection",
	data : { }
}

type IndentSelection = {
	type : "IndentSelection",
	data : { }
}

type UnindentSelection = {
	type : "UnindentSelection",
	data : { }
}

type CopySelection = {
	type : "CopySelection",
	data : { }
}

type Paste = {
	type : "Paste",
	data : {
		item : Item.Item
	}
}


export type Action = 	AddItemToParent | 
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
						MultiSelect;

// REDUCERS

function addItemToParent(document : Document | undefined, action : AddItemToParent) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	Doc.addItem(document, action.data.parent);
	return document;
}

function addItemAfterSibling(document : Document | undefined, action : AddItemAfterSibling) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	const { sibling, focusOnNew } = action.data;
	const parent = document.items.get(sibling.parentID);
	if (!parent)
		return document;

	const indexOfSibling = parent.children.findIndex(sid => sid == sibling.itemID);
	if (indexOfSibling == -1)
		return document;

	const item = Item.newItemFromParent(parent);
	const newDocument = Doc.addItem(document, parent, indexOfSibling + 1, item);
	
	return focusOnNew ? 
			setFocus(newDocument, { type: "SetFocus", data: { item } }) :
			newDocument;
}

function toggleItemCollapse(document : Document | undefined, action : ToggleItemCollapse) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	const item = action.data.item;
	if (item.children.count() <= 0)
		return document;

	return Doc.updateItems(document, {
		...item,
		view: {
			...item.view,
			collapsed: !item.view.collapsed
		}
	});
}

function updateItemText(document : Document | undefined, action : UpdateItemText) : Document {
	if (!document)
		return Doc.getEmptyDocument();
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

	return Doc.updateItems({
		...document,
		title: newTitle
	}, newItem);
}

function removeItem(document : Document | undefined, action : RemoveItem) : Document {
	if (!document)
		return Doc.getEmptyDocument();
	else if (!document.items.get(action.data.item.itemID) || action.data.item.itemID == document.rootItemID)
		return document;

	const item = action.data.item;
	const nextItem = Doc.getNextItem(document, item);
	const prevSibling = Doc.getPrevSibling(document, item);

	const children = item.children.map(childID => document.items.get(childID));	
	
	if (prevSibling) {
		children.forEach(c => Doc.moveItem(document, prevSibling, Infinity, c));
	} else {
		children.reverse().forEach(c => Doc.unindentItem(document, c));
	}
	
	const newDocument = Doc.removeItem(document, item, false);
	return (newDocument.focusedItemID == item.itemID) ? setFocus(newDocument, { type: "SetFocus", data: { item: nextItem } }) : newDocument;
}

function setFocus(document : Document | undefined, action : SetFocus) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	const item = action.data.item;

	return {
		...document,
		focusedItemID: (item == undefined ? undefined : item.itemID)
	};
}

function incrementFocus(document : Document | undefined, action : IncrementFocus) : Document {
	if (!document)
		return Doc.getEmptyDocument();
	if (!document.focusedItemID || !document.items.get(document.focusedItemID))
		return setFocus(document, { type: "SetFocus", data: { item: document.items.get(document.rootItemID) } });

	const { createNewItem } = action.data;
	const focusedItem = document.items.get(document.focusedItemID);
	const focusedParent = (focusedItem.itemID == document.rootItemID ? {...focusedItem} : document.items.get(focusedItem.parentID));

	const nextItem = Doc.getNextItem(document, focusedItem, true);
	if (nextItem != undefined) {
		return setFocus(document, { type: "SetFocus", data: { item: nextItem } });
	} else if (!createNewItem) {
		return setFocus(document, { type: "SetFocus", data: { item: undefined } });
	}

	const newItem = Item.newItemFromParent(focusedParent);
	const newDocument = Doc.addItem(document, focusedParent, focusedParent.children.count(), newItem);

	return setFocus(newDocument, { type: "SetFocus", data: { 
		item: newItem
	} });	
}

function decrementFocus(document : Document | undefined, action : DecrementFocus) : Document {
	if (!document)
		return Doc.getEmptyDocument();
	if (!document.focusedItemID || !document.items.get(document.focusedItemID))
		return setFocus(document, { type: "SetFocus", data: { item: Doc.getLastItem(document, document.items.get(document.rootItemID), true) } });

	const focusedItem = document.items.get(document.focusedItemID);
	if (focusedItem.itemID == document.rootItemID)
		return setFocus(document, { type: "SetFocus", data: { item: undefined } });

	const prevItem = Doc.getPrevItem(document, focusedItem, true);
	return setFocus(document, { type: "SetFocus", data: { item: prevItem } });
}

function indentItem(document : Document | undefined, action : IndentItem) : Document {	
	if (!document)
		return Doc.getEmptyDocument();

	const item = action.data.item;
	const parent = document.items.get(item.parentID);
	if (!parent)
		return document;

	const indentation = Doc.indentItem(document, item);
	let newDocument = indentation.document;
	const indented = indentation.moved;

	if (indented.parentID == item.parentID)
		return indentItem(document, { type: "IndentItem", data: { item: document.items.get(item.parentID) } });
	return document;
}

function unindentItem(document : Document | undefined, action : UnindentItem) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	const item = action.data.item;
	if (!item)
		return document;

	const indentation = Doc.unindentItem(document, item);
	let newDocument = indentation.document;
	const indented = indentation.moved;

	if (indented.parentID == item.parentID) {
		const nextItem = Doc.getNextItem(document, indented);
		if (nextItem)
			return unindentItem(newDocument, { type: "UnindentItem", data: { item: nextItem } });
	}

	return newDocument;
}

function makeHeader(document : Document | undefined, action : MakeHeader) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	const item = action.data.item;

	if (item.itemID == document.rootItemID)
		return document;

	function getPreviousHeaderLevel(doc : Document, curr : Item.Item) : number {
		if (!curr || !curr.parentID || curr.itemID == doc.rootItemID)
			return 0;

		const hashes = curr.text.match(/(#+)\s+.*/);
		if (!hashes || hashes.length < 2)
			return getPreviousHeaderLevel(doc, doc.items.get(curr.parentID));

		return hashes[1].length;
	}

	let hashes = '';
	const numHashes = getPreviousHeaderLevel(document, document.items.get(item.parentID)) + 1;

	for (let i = 0; i < numHashes && i < 6; i++) {
		hashes += '#';
	}

	const newItem : Item.Item = {
		...item,
		text: item.text.replace(/^(#+\s)?/, hashes + ' '),
		view: {
			...item.view,
			itemType: "Header"
		}
	};

	return Doc.updateItems(document, newItem);
}

function makeItem(document : Document | undefined, action : MakeItem) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	const item = action.data.item;

	if (item.itemID == document.rootItemID)
		return document;

	const newItem : Item.Item = {
		...item,
		text: item.text.replace(/^(#+\s)?/, ''),
		view: {
			...item.view,
			itemType: "Item"
		}
	};

	return Doc.updateItems(document, newItem);
}

function copyItem(document : Document | undefined, action : CopyItem) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	const item = action.data.item;

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

function copySelection(document : Document | undefined, action : CopySelection) : Document {
	if (!document)
		return Doc.getEmptyDocument();
	if (!document.selection) {
		return {
			...document,
			clipboard: undefined
		};
	}

	const selectedItems = Doc.getSelectedItems(document);

	const selectionRoot = Doc.getSelectionParent(document);
	if (!selectionRoot) {
		return {
			...document,
			clipboard: undefined
		};
	}

	const selectionSubtree = Doc.copySubtree(document, selectionRoot);

	return {
		...document,
		clipboard:{
			...document,
			rootItemID: selectionRoot.itemID,
			items: selectionSubtree,
			selection: { ...document.selection },
			clipboard: undefined
		}
	};
}

function makeSelectionItem(document : Document | undefined, action : MakeSelectionItem) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	return Doc.getSelectionRange(document)
		.map(selected => makeItem(document, { type: "MakeItem", data : { item: selected } }))
		.reduce((prev, curr) => curr, document);
}

function makeSelectionHeader(document : Document | undefined, action : MakeSelectionHeader) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	return Doc.getSelectionRange(document)
			.map(selected => makeHeader(document, { type: "MakeHeader", data : { item: selected } }))
			.reduce((prev, curr) => curr, document);
}

function removeSelection(document : Document | undefined, action : RemoveSelection) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	let newDocument = document;

	const selectionRange = Doc.getSelectionRange(document);
	selectionRange.forEach(selected => {
		if (selected.itemID in document.items)
			newDocument = removeItem(document, { type: "RemoveItem", data: { item: document.items.get(selected.itemID) } });
	});

	return {
		...newDocument,
		selection: undefined
	}
}

function indentSelection(document : Document | undefined, action : IndentSelection) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	const selectionRange = Doc.getSelectionRange(document);
	const selectedItems = Doc.getSelectedItems(document);

	let itemsToIndent : Item.Item[] = [];

	for (let curr : Item.Item | undefined = selectionRange[0]; curr != undefined && curr.itemID in selectedItems; ) {
		itemsToIndent.push(curr);

		let next = Doc.getNextSibling(document, curr);
		
		while (!next) {
			const nextParent = Doc.getParent(document, curr);

			if (!nextParent) {
				curr = undefined;
				break;
			}

			curr = nextParent;
			next = Doc.getNextSibling(document, curr);
		}

		curr = next;
	}

	for (const item of itemsToIndent) {
		const updatedItem = document.items.get(item.itemID);
		const indentedItem = Doc.indentItem(document, updatedItem);
	}

	return document;
}

function unindentSelection(document : Document | undefined, action : UnindentSelection) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	const selectionRange = Doc.getSelectionRange(document);
	const selectedItems = Doc.getSelectedItems(document);

	let itemsToUnindent : Item.Item[] = [];

	for (let curr : Item.Item | undefined = selectionRange[0]; curr != undefined && curr.itemID in selectedItems; ) {
		itemsToUnindent.push(curr);

		let next = Doc.getNextSibling(document, curr);
		
		while (!next) {
			const nextParent = Doc.getParent(document, curr);

			if (!nextParent) {
				curr = undefined;
				break;
			}

			curr = nextParent;
			next = Doc.getNextSibling(document, curr);
		}

		curr = next;
	}

	itemsToUnindent.forEach(item => {
		const updatedItem = document.items.get(item.itemID);
		Doc.unindentItem(document, updatedItem);
	});

	return document;
}

function paste(document : Document | undefined, action : Paste) : Document {
	if (!document)
		return Doc.getEmptyDocument();
	if (!document.clipboard || !document.clipboard.selection)
		return document;

	let newDocument = document;

	let clipboard = Doc.regenerateIDs(document.clipboard);
	let inSelection = false;

	const selectedItems = Doc.getSelectedItems(clipboard);
	const selection = clipboard.selection;

	const item = Item.copyItem(action.data.item);

	const addToParent = (item.children.count() > 0 && !item.view.collapsed) || item.itemID == document.rootItemID;
	const pasteBelow = !addToParent ? item : Item.newItemFromParent(item);
	if (addToParent)
		Doc.addItem(newDocument, item, 0, pasteBelow);

	let prevDoc : Item.Item | undefined = pasteBelow;
	let prevSel : Item.Item | undefined = undefined;

	for (let curr : Item.Item | undefined = clipboard.items.get(clipboard.rootItemID); curr != undefined; curr = Doc.getNextItem(clipboard, curr)) {
		if (!curr || !prevDoc || !selection)
			break;

		if (curr.itemID == selection.start || curr.itemID == selection.end)
			inSelection = !inSelection;
		if (!inSelection && curr.itemID != selection.start && curr.itemID != selection.end)
			continue;

		let newItem = curr;

		if (!prevSel || prevSel.itemID != curr.parentID) {
			const prevParent = document.items.get(prevDoc.parentID);
			const prevIndex = prevParent.children.indexOf(prevDoc.itemID);

			newItem = { ...curr, parentID: prevParent.itemID, children: List<Item.ItemID>() };
			newDocument = Doc.addItem(newDocument, prevParent, prevIndex + 1, );
		} else {
			newItem = { ...curr, parentID: prevDoc.itemID, children: List<Item.ItemID>() };
			newDocument = Doc.addItem(document, prevDoc, 0, newItem);
		} 

		prevSel = curr;
		prevDoc = newItem;
	}
	
	if (addToParent)
		Doc.removeItem(document, pasteBelow);

	return document;
}

function multiSelect(document : Document | undefined, action : MultiSelect) : Document {
	if (!document)
		return Doc.getEmptyDocument();

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

function initializeDocument(document : Document | undefined, action : InitializeDocument) : Document {
	if (action.data.document)
		return action.data.document;
	return Doc.getEmptyDocument();
}

export function reducer(document : Document | undefined, anyAction : AnyAction) : Document {
	const action = anyAction as Action;
	let doc = !document ? undefined : Doc.copyDocument(document);

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
		default:
			return doc || Doc.getEmptyDocument();
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
	initializeDocument: (document: Document | undefined) => dispatch({
		type: "InitializeDocument",
		data : { document }
	}),
	removeItem: (item: Item.Item) => dispatch({
		type: "RemoveItem",
		data: { item }
	}),
	updateItemText: (item: Item.Item, newText: string) => dispatch({
		type: "UpdateItemText",
		data: { item, newText }
	}),
	setFocus: (item : Item.Item | undefined) => dispatch({
		type: "SetFocus",
		data: { item }
	}),
	incrementFocus: (createNewItem : boolean) => dispatch({
		type: "IncrementFocus",
		data: { createNewItem }
	}),
	decrementFocus: () => dispatch({
		type: "DecrementFocus",
		data: { }
	}),
	indentItem: (item : Item.Item) => dispatch({
		type: "IndentItem",
		data: { item }
	}),
	unindentItem: (item : Item.Item) => dispatch({
		type: "UnindentItem",
		data: { item }
	}),
	makeHeader: (item : Item.Item) => dispatch({
		type: "MakeHeader",
		data: { item }
	}),
	makeItem: (item : Item.Item) => dispatch({
		type: "MakeItem",
		data: { item }
	}),
	copyItem: (item : Item.Item) => dispatch({
		type: "CopyItem",
		data: { item }
	}),
	multiSelect: (item: Item.Item | undefined) => dispatch({
		type: "MultiSelect",
		data: { item }
	}),
	makeSelectionItem: () => dispatch({
		type: "MakeSelectionItem",
		data: { }
	}),
	makeSelectionHeader: () => dispatch({
		type: "MakeSelectionHeader",
		data: { }
	}),
	removeSelection: () => dispatch({
		type: "RemoveSelection",
		data: { }
	}),
	indentSelection: () => dispatch({
		type: "IndentSelection",
		data: { }
	}),
	unindentSelection: () => dispatch({
		type: "UnindentSelection",
		data: { }
	}),
	copySelection: () => dispatch({
		type: "CopySelection",
		data: { }
	}),
	paste: (item: Item.Item) => dispatch({
		type: "Paste",
		data: { item }
	}),
	undo: () => dispatch(ActionCreators.undo()),
	redo: () => dispatch(ActionCreators.redo()),
});

export type DispatchProps = {
	addItemToParent: (parent: Item.Item) => void,
	addItemAfterSibling: (parent: Item.Item, focusOnNew: boolean) => void,
	toggleItemCollapse: (item: Item.Item) => void,
	initializeDocument: (document: Document | undefined) => void,
	updateItemText: (item: Item.Item, newText: string) => void,
	removeItem: (item: Item.Item) => void,
	setFocus: (item : Item.Item | undefined) => void,
	incrementFocus: (createNewData : boolean) => void,
	decrementFocus: () => void,
	indentItem: (item : Item.Item) => void,
	unindentItem: (item : Item.Item) => void,
	makeHeader: (item : Item.Item) => void,
	makeItem: (item : Item.Item) => void,
	copyItem: (item : Item.Item) => void,
	multiSelect: (item : Item.Item | undefined) => void,
	makeSelectionItem: () => void,
	makeSelectionHeader: () => void,
	removeSelection: () => void,
	indentSelection: () => void,
	unindentSelection: () => void,
	copySelection: () => void,
	paste: (item: Item.Item) => void,
	undo: () => void,
	redo: () => void
}

export const skipHistoryFor : string[] = ["CopyItem", "CopySelection", "SetFocus", "IncrementFocus", "DecrementFocus", "SetFocus"];