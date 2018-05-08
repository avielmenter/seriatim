import { ActionCreator, AnyAction } from 'redux';
import undoable, { ActionCreators } from 'redux-undo';

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

type MultiSelect = {
	type : "MultiSelect",
	data : {
		item : Item.Item | undefined
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
	const parent = document.items[sibling.parentID];
	if (!parent)
		return document;

	const indexOfSibling = parent.children.findIndex(sid => sid == sibling.itemID);
	if (indexOfSibling == -1)
		return document;

	const item = Doc.addItem(document, parent, indexOfSibling + 1);
	
	return focusOnNew ? 
			setFocus(document, { type: "SetFocus", data: { item } }) :
			document;
}

function toggleItemCollapse(document : Document | undefined, action : ToggleItemCollapse) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	const item = action.data.item;
	if (item.children.length <= 0)
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
	else if (!document.items[action.data.item.itemID])
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
	else if (!document.items[action.data.item.itemID] || action.data.item.itemID == document.rootItemID)
		return document;

	const item = action.data.item;
	const prevItem = Doc.getPrevItem(document, item);
	
	Doc.removeItem(document, item);
	
	return (document.focusedItemID == item.itemID) ? setFocus(document, { type: "SetFocus", data: { item: prevItem } }) : document;
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
	if (!document.focusedItemID || !document.items[document.focusedItemID])
		return setFocus(document, { type: "SetFocus", data: { item: document.items[document.rootItemID] } });

	const { createNewItem } = action.data;
	const focusedItem = document.items[document.focusedItemID];
	const focusedParent = (focusedItem.itemID == document.rootItemID ? {...focusedItem} : document.items[focusedItem.parentID]);

	const nextItem = Doc.getNextItem(document, focusedItem);
	if (nextItem != undefined) {
		return setFocus(document, { type: "SetFocus", data: { item: nextItem } });
	} else if (!createNewItem) {
		return setFocus(document, { type: "SetFocus", data: { item: undefined } });
	}

	return setFocus(document, { type: "SetFocus", data: { 
		item: Doc.addItem(document, focusedParent, focusedParent.children.length) 
	} });	
}

function decrementFocus(document : Document | undefined, action : DecrementFocus) : Document {
	if (!document)
		return Doc.getEmptyDocument();
	if (!document.focusedItemID || !document.items[document.focusedItemID])
		return setFocus(document, { type: "SetFocus", data: { item: Doc.getLastItem(document) } });

	const focusedItem = document.items[document.focusedItemID];
	if (focusedItem.itemID == document.rootItemID)
		return setFocus(document, { type: "SetFocus", data: { item: undefined } });

	const prevItem = Doc.getPrevItem(document, focusedItem);
	return setFocus(document, { type: "SetFocus", data: { item: prevItem } });
}

function indentItem(document : Document | undefined, action : IndentItem) : Document {	
	if (!document)
		return Doc.getEmptyDocument();

	const item = action.data.item;
	const parent = document.items[item.parentID];
	if (!parent)
		return document;

	const indented = Doc.indentItem(document, item);
	if (indented.parentID == item.parentID)
		return indentItem(document, { type: "IndentItem", data: { item: document.items[item.parentID] } });
	return document;
}

function unindentItem(document : Document | undefined, action : UnindentItem) : Document {
	if (!document)
		return Doc.getEmptyDocument();

	const item = action.data.item;
	if (!item)
		return document;

	const indented = Doc.unindentItem(document, item);
	if (indented.parentID == item.parentID) {
		const nextItem = Doc.getNextItem(document, indented);
		if (nextItem)
			return unindentItem(document, { type: "UnindentItem", data: { item: nextItem } });
	}

	return document;
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
			return getPreviousHeaderLevel(doc, doc.items[curr.parentID]);

		return hashes[1].length;
	}

	let hashes = '';
	const numHashes = getPreviousHeaderLevel(document, document.items[item.parentID]) + 1;

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
		case "MultiSelect":
			return multiSelect(doc, action);
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
	multiSelect: (item: Item.Item | undefined) => dispatch({
		type: "MultiSelect",
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
	multiSelect: (item : Item.Item | undefined) => void,
	undo: () => void,
	redo: () => void
}