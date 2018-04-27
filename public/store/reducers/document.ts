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
		sibling : Item.Item
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
		focusIndex : number,
		createNewItem : boolean
	}
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
	focusIndex: -1,
	items: { 
		"root": {
			itemID: "root",
			itemType: "Title",
			text: "Untitled Document",
			parentID: "",
			children: [],
			view: {
				collapsed: false
			}
		}
	}
}

function getNewItemFromParent(parent : Item.Item) : Item.Item {
	return {
		itemID: generateItemID(), // parent.itemID + "." + parent.children.length.toString(),
		parentID: parent.itemID,
		itemType: "Item",
		children: [],
		text: "",
		view: {
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

function setItemEditability(document: Document | undefined, itemID : Item.ItemID, editable : boolean) : Document {
	if (!document)
		return emptyDocument;
	else if (!document.items[itemID])
		return document;

	const oldItem = document.items[itemID];

	const newItem = {
		...oldItem,
		view: {
			...oldItem.view,
			editable
		}
	};

	return updateDocumentDictionary(document, [newItem]);
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

	const { sibling } = action.data;
	const parent = doc.items[sibling.parentID];
	if (!parent)
		return doc;

	const indexOfSibling = parent.children.findIndex(sid => sid == sibling.itemID);
	if (indexOfSibling == -1)
		return doc;

	const item = getNewItemFromParent(parent);
	let newParent = { ...parent };
	newParent.children.splice(indexOfSibling + 1, 0, item.itemID);

	return updateDocumentDictionary(doc, [item, newParent]);
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
		itemType: (item.itemType == "Title" ? "Title" : newType) as Item.ItemType
	};

	const newTitle = newItem.itemType == "Title" ? newItem.text : document.title; 

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
		items: newDictionary
	};
}

function setFocus(document : Document | undefined, action : SetFocus) : Document {
	if (!document)
		return emptyDocument;

	if (!action.data.createNewItem || action.data.focusIndex != Object.keys(document.items).length) {
		return {
			...document,
			focusIndex: action.data.focusIndex
		}
	}

	let index : number = 0;

	function findElementByIndex(document : Document, curr : Item.Item) : Item.Item | undefined {
		if (index == action.data.focusIndex - 1)
			return curr;

		if (!curr)
			return undefined;

		index++;
		for (const child of curr.children.map(childID => document.items[childID])) {
			const found = findElementByIndex(document, child);
			if (found)
				return found;
		}

		return undefined;
	}
	
	const lastItem = findElementByIndex(document, document.items[document.rootItemID]);
	if (!lastItem) {
		return {
			...document,
			focusIndex : action.data.focusIndex
		}
	}

	const newDocument = lastItem.itemType == "Title" ? 
							addItemToParent(document, { type: "AddItemToParent", data: { parent: lastItem } }) :
							addItemAfterSibling(document, { type: "AddItemAfterSibling", data: { sibling: lastItem } });

	return {
		...newDocument,
		focusIndex: action.data.focusIndex
	}
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
	if (!oldParent || oldParent.itemType == "Title") {
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
	addItemAfterSibling: (sibling: Item.Item) => dispatch({
		type: "AddItemAfterSibling",
		data: { sibling }
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
	setFocus: (focusIndex : number, createNewItem : boolean) => dispatch({
		type: "SetFocus",
		data: { focusIndex, createNewItem }
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
	addItemAfterSibling: (parent: Item.Item) => void,
	toggleItemCollapse: (item: Item.Item) => void,
	initializeDocument: (document: Document | undefined) => void,
	updateItemText: (item: Item.Item, newText: string) => void,
	removeItem: (item: Item.Item) => void,
	setFocus: (focusIndex : number, createNewItem : boolean) => void,
	indentItem: (item : Item.Item) => void,
	unindentItem: (item : Item.Item) => void
}