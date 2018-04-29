import { ActionCreator } from 'redux';

import { ApplicationState } from '../data';
import * as Item from '../data/item';
import { Document, ItemDictionary } from '../data/document';

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
						UpdateItemText;

// HELPER FUNCTIONS

function generateItemID() : Item.ItemID { 	// copied from https://stackoverflow.com/a/105074 
	function s4() : string {				// NOT GUARANTEED TO BE GLOBALLY UNIQUE
		return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);
	}

	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

const emptyDocument : Document = {
	title: "Untitled Document",
	rootItemID: "root",
	focusedItemID: undefined,
	items: { 
		"root": {
			itemID: "root",
			text: "Untitled Document",
			parentID: "",
			children: [],
			view: {
				itemType: "Title",
				focused: false,
				collapsed: false
			}
		}
	}
}

function getNewItemFromParent(parent : Item.Item) : Item.Item {
	return {
		itemID: generateItemID(), // parent.itemID + "." + parent.children.length.toString(),
		parentID: parent.itemID,
		children: [],
		text: "",
		view: {
			itemType: "Item",
			focused: false,
			collapsed: false
		}
	};
}

function updateDocumentDictionary(doc : Document, newItemsList : Item.Item[]) : Document {
	let newItems : ItemDictionary = Object.assign({}, doc.items);
	for (const i of newItemsList) {
		newItems[i.itemID] = i;
	}

	return {
		...doc,
		items: newItems
	}
}

// REDUCERS

function addItemToParent(document : Document | undefined, action : AddItemToParent) : Document {
	const doc = document;
	if (!doc)
		return emptyDocument;

	const { parent } = action.data;
	const item = getNewItemFromParent(parent);

	const newParent = {
		...parent,
		children: parent.children.concat([item.itemID])
	};

	return updateDocumentDictionary(doc, [item, newParent]);
}

function addItemAfterSibling(document : Document | undefined, action : AddItemAfterSibling) : Document {
	const doc = document;
	if (!doc)
		return emptyDocument;

	const { sibling, focusOnNew } = action.data;
	const parent = doc.items[sibling.parentID];
	if (!parent)
		return doc;

	const indexOfSibling = parent.children.findIndex(sid => sid == sibling.itemID);
	if (indexOfSibling == -1)
		return doc;

	const item = getNewItemFromParent(parent);
	let newParent = { ...parent };
	newParent.children.splice(indexOfSibling + 1, 0, item.itemID);

	const docWithSibling = updateDocumentDictionary(doc, [item, newParent]);
	return focusOnNew ? 
			setFocus(docWithSibling, { type: "SetFocus", data: { item } }) :
			docWithSibling;
}

function toggleItemCollapse(document : Document | undefined, action : ToggleItemCollapse) : Document {
	if (!document)
		return emptyDocument;
	else if (!document.items[action.data.item.itemID])
		return document;

	const newItem = {
		...action.data.item,
		view: {
			...action.data.item.view,
			collapsed: !action.data.item.view.collapsed
		}
	};

	return updateDocumentDictionary(document, [newItem])
}

function updateItemText(document : Document | undefined, action : UpdateItemText) : Document {
	if (!document)
		return emptyDocument;
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

	return updateDocumentDictionary({ ...document, title: newTitle }, [newItem]);
}

function removeItem(document : Document | undefined, action : RemoveItem) : Document {
	if (!document)
		return emptyDocument;
	else if (!document.items[action.data.item.itemID])
		return document;

	function removeItemFromDictionary(dict : ItemDictionary, itemID : Item.ItemID) : void {
		const item = dict[itemID];
		if (!item)
			return;

		delete dict[itemID];
		const children = item.children;

		children.forEach(child => removeItemFromDictionary(dict, child));
	}

	const { item } = action.data;

	let newDictionary = Object.assign({}, document.items);
	removeItemFromDictionary(newDictionary, item.itemID);

	if (newDictionary[item.parentID]) {
		let parent = newDictionary[item.parentID];
		const childIndex = parent.children.indexOf(item.itemID);

		if (childIndex >= 0) {
			parent.children = parent.children.slice(0, childIndex).concat(parent.children.slice(childIndex + 1));
			newDictionary[item.parentID] = parent;
		}
	}
	
	return {
		...document,
		focusedItemID: document.focusedItemID == action.data.item.itemID ? undefined : document.focusedItemID,
		items: newDictionary
	}
}

function setFocus(document : Document | undefined, action : SetFocus) : Document {
	if (!document)
		return emptyDocument;

	const { item } = action.data;
	if (!item) {
		if (!document.focusedItemID || !document.items[document.focusedItemID]) {
			return {
				...document,
				focusedItemID: undefined
			}
		}

		const prevFocus = document.items[document.focusedItemID];
		const unfocused = {...prevFocus, view: { ...prevFocus.view, focused: false } };

		return {
			...updateDocumentDictionary(document, [unfocused]),
			focusedItemID: undefined
		};
	}

	if (document.focusedItemID == item.itemID)
		return document;

	let newItems = [];

	const newFocus = {
		...item,
		view: {
			...item.view,
			focused: true
		}
	};

	newItems.push(newFocus);

	if (document.focusedItemID !== undefined && document.items[document.focusedItemID]) {
		const oldFocused = {
			...document.items[document.focusedItemID],
			view: {
				...document.items[document.focusedItemID].view,
				focused: false
			}
		};

		newItems.push(oldFocused);
	}

	return {
		...updateDocumentDictionary(document, newItems),
		focusedItemID: item.itemID
	};
}

function incrementFocus(document : Document | undefined, action : IncrementFocus) : Document {
	if (!document)
		return emptyDocument;
	if (!document.focusedItemID || !document.items[document.focusedItemID])
		return setFocus(document, { type: "SetFocus", data: { item: document.items[document.rootItemID] } });

	const { createNewItem } = action.data;
	const focusedItem = document.items[document.focusedItemID];
	const focusedParent = (focusedItem.itemID == document.rootItemID ? {...focusedItem} : document.items[focusedItem.parentID]);

	function getNextItem(doc: Document, curr : Item.Item, prevIndex : number) : Item.Item | undefined {
		if (curr.children.length > prevIndex + 1)
			return doc.items[curr.children[prevIndex + 1]];

		const currParent = doc.items[curr.parentID];
		if (!currParent)
			return undefined;

		const currIndex = currParent.children.indexOf(curr.itemID);
		return getNextItem(doc, currParent, currIndex);
	}

	const nextItem = getNextItem(document, focusedItem, -1);
	if (nextItem)
		return setFocus(document, { type: "SetFocus", data: { item: nextItem } });
	else if (!createNewItem)
		return setFocus(document, { type: "SetFocus", data: { item: undefined } });
	
	const newItem = getNewItemFromParent(focusedParent);

	const newParent = {
		...focusedParent,
		children: focusedParent.children.concat([newItem.itemID])
	};

	return setFocus(
		updateDocumentDictionary(document, [newItem, newParent]),
		{ type: "SetFocus", data: { item: newItem } }
	);
}

function decrementFocus(document : Document | undefined, action : DecrementFocus) : Document {
	if (!document)
		return emptyDocument;

	function getLastChild(doc : Document, curr : Item.Item) : Item.Item {
		if (curr.children.length == 0)
			return curr;

		const lastChild = doc.items[curr.children[curr.children.length - 1]];
		return getLastChild(doc, lastChild);
	}

	if (!document.focusedItemID || !document.items[document.focusedItemID])
		return setFocus(document, { type: "SetFocus", data: { item: getLastChild(document, document.items[document.rootItemID]) } });

	const focusedItem = document.items[document.focusedItemID];
	if (focusedItem.itemID == document.rootItemID)
		return setFocus(document, { type: "SetFocus", data: { item: undefined } });

	const focusedParent = document.items[focusedItem.parentID];
	const focusedIndex = focusedParent.children.indexOf(focusedItem.itemID);

	if (focusedIndex <= 0)
		return setFocus(document, { type: "SetFocus", data: { item: focusedParent } } );

	const prevItem = document.items[focusedParent.children[focusedIndex - 1]];
	return setFocus(document, { type: "SetFocus", data: { item: getLastChild(document, prevItem) } });
}

function indentItem(document : Document | undefined, action : IndentItem) : Document {
	if (!document)
		return emptyDocument;

	const item = action.data.item;
	const parent = document.items[item.parentID];
	if (!parent)
		return document;

	const childIndex = parent.children.indexOf(item.itemID);
	if (childIndex < 0)
		return document;
	else if (childIndex == 0)
		return indentItem(document, { type: "IndentItem", data: { item: parent } });

	const prevSiblingID = parent.children[childIndex - 1];
	const prevSibling = document.items[prevSiblingID];

	if (!prevSibling)
		return document;

	let newParent = { ...parent };
	let newSiblingIDs = newParent.children.splice(childIndex, parent.children.length - childIndex);

	let newPrevSibling = { ...prevSibling }
	newPrevSibling.children = newPrevSibling.children.concat(newSiblingIDs);

	const newSiblings = newSiblingIDs
							.map(id => document.items[id])
							.filter(sibling => sibling !== undefined && sibling !== null)
							.map(sibling => ({...sibling, parentID: prevSibling.itemID }));

	return updateDocumentDictionary(document, [newParent, newPrevSibling, ...newSiblings]);
}

function UnindentItem(document : Document | undefined, action : UnindentItem) : Document {
	if (!document)
		return emptyDocument;

	const item = action.data.item;
	const oldParent = document.items[item.parentID];
	if (!oldParent || oldParent.itemID == document.rootItemID) {
		if (item.children.length > 0 && document.items[item.children[0]]) 
			return UnindentItem(document, { ...action, data: { item: document.items[item.children[0]] } });
		return document;
	}
	const oldGrandparent = document.items[oldParent.parentID];
	if (!oldGrandparent)
		return document;

	const childIndex = oldParent.children.indexOf(item.itemID);
	const parentIndex = oldGrandparent.children.indexOf(oldParent.itemID);

	const newItem = {
		...item,
		parentID: oldGrandparent.parentID
	}

	let newParent = { ...oldParent };
	let newSiblingIDs = newParent.children.splice(childIndex, oldParent.children.length - childIndex);

	let newGrandparent = { ...oldGrandparent };
	newGrandparent.children.splice(parentIndex + 1, 0, ...newSiblingIDs);

	const newSiblings = newSiblingIDs
							.map(id => document.items[id])
							.filter(sibling => sibling !== undefined && sibling !== null)
							.map(sibling => ({...sibling, parentID: newGrandparent.itemID }));

	return updateDocumentDictionary(document, [newItem, newParent, newGrandparent, ...newSiblings]);
}

function initializeDocument(document : Document | undefined, action : InitializeDocument) : Document {
	if (action.data.document)
		return action.data.document;
	return emptyDocument;
}

export function reducer(doc : Document | undefined, action : Store.Action) : Document {
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
			return UnindentItem(doc, action);
		default:
			return doc || emptyDocument;
	}
}

// DISPATCH PROPERTIES

type Dispatch = (action: Action) => void;

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
	})
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
	unindentItem: (item : Item.Item) => void
}