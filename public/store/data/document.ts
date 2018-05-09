import { Item, ItemID, newItemFromParent, copyItem } from './item';

export type ItemDictionary = { [itemID : string] : Item};

type SelectionRange = {
	start : ItemID,
	end : ItemID
}

export default interface Document {
	title : string,
	rootItemID : ItemID,
	focusedItemID : ItemID | undefined,
	selection : SelectionRange | undefined,
	items : ItemDictionary
}

export function copyDocument(d : Document) : Document {
	return JSON.parse(JSON.stringify(d));
}

export function equals(lhs : any, rhs : any) : boolean {
	return JSON.stringify(lhs) == JSON.stringify(rhs);
}

export function getEmptyDocument() : Document {
	return {
		title: "Untitled Document",
		rootItemID: "root",
		focusedItemID: undefined,
		selection: undefined,
		items: { 
			"root": {
				itemID: "root",
				text: "Untitled Document",
				parentID: "",
				children: [],
				view: {
					itemType: "Title",
					collapsed: false
				}
			}
		}
	}
}

export function getParent(document : Document, curr : Item) : Item | undefined {
	const parent = document.items[curr.parentID];
	return !parent ? undefined : parent;
}

export function getLastItem(document : Document, curr : Item = document.items[document.rootItemID], skipInvisible : boolean = false) : Item {
	if (curr.children.length == 0 || (skipInvisible && curr.view.collapsed))
		return curr;

	const lastChild = document.items[curr.children[curr.children.length - 1]];
	if (!lastChild)
		return curr;
	return getLastItem(document, lastChild, skipInvisible); 
}

export function getNextItem(document : Document, curr : Item, skipInvisible : boolean = false, prevIndex : number = -1) : Item | undefined {
	if (curr.children.length > prevIndex + 1 && (!skipInvisible || !curr.view.collapsed))
		return document.items[curr.children[prevIndex + 1]];

	const currParent = document.items[curr.parentID];
	if (!currParent)
		return undefined;

	const currIndex = currParent.children.indexOf(curr.itemID);
	return getNextItem(document, currParent, skipInvisible, currIndex);
}

export function getPrevItem(document : Document, curr : Item, skipInvisible : boolean = false) : Item | undefined {
	const parent = document.items[curr.parentID];
	if (!parent)
		return undefined;

	const currIndex = parent.children.indexOf(curr.itemID);
	return currIndex > 0 ? getLastItem(document, document.items[parent.children[currIndex - 1]], skipInvisible) : parent;
}

export function getNextSibling(document : Document, curr : Item) : Item | undefined {
	const parent = document.items[curr.parentID];
	if (!parent)
		return undefined;

	const childIndex = parent.children.indexOf(curr.itemID);
	if (childIndex < 0 || childIndex >= parent.children.length - 1)
		return undefined;

	return document.items[parent.children[childIndex + 1]];
}

export function getPrevSibling(document : Document, curr : Item) : Item | undefined {
	const parent = document.items[curr.parentID];
	if (!parent)
		return undefined;

	const childIndex = parent.children.indexOf(curr.itemID);
	if (childIndex <= 0)
		return undefined;

	return document.items[parent.children[childIndex - 1]];
}

export function getFirstItem(document : Document) : Item {
	return document.items[document.rootItemID];
}

export function removeItem(document : Document, item : Item, cascade : boolean = true) : Item {
	const parent = document.items[item.parentID];
	if (parent) {
		const itemIndex = parent.children.indexOf(item.itemID);
		document.items[item.parentID].children.splice(itemIndex, 1);
	}

	if (cascade) {
		item.children
			.map(childID => document.items[childID])
			.filter(child => child != undefined)
			.map(child => removeItem(document, child));
	}

	const itemCopy = {
		...item,
		view: { ...item.view }
	}

	delete document.items[item.itemID];
	return itemCopy;
}

export function addItem(document : Document, parent : Item, at : number = 0, item : Item | undefined = undefined) : Item {
	const childIndex = Math.min(Math.max(at, 0), parent.children.length);
	const child = item != undefined ? { ...copyItem(item), parentID: parent.itemID } : newItemFromParent(parent);

	document.items[parent.itemID].children.splice(childIndex, 0, child.itemID);
	document.items[child.itemID] = child;

	return child;
}

export function moveItem(document : Document, newParent : Item, at : number = 0, item : Item) : Item {
	const parent = document.items[item.parentID];
	if (!parent)
		return item;

	const childIndex = Math.min(Math.max(at, 0), newParent.children.length);

	const newItem = { ...copyItem(item), parentID: newParent.itemID };
	const itemIndex = parent.children.indexOf(item.itemID);

	document.items[newItem.parentID].children.splice(childIndex, 0, newItem.itemID);
	document.items[item.parentID].children.splice(itemIndex, 1);
	document.items[newItem.itemID] = newItem;

	return newItem;
}

export function getItemIndex(document : Document, item : Item) : number {
	const parent = document.items[item.parentID];
	if (!parent)
		return 0;

	return parent.children.indexOf(item.itemID);
}

export function getSelectionRange(document : Document) : Item[] {
	if (!document.selection)
		return [];

	let curr : Item | undefined = document.items[document.rootItemID];
	let inRange = false;
	let items : Item[] = [];

	while (curr = getNextItem(document, curr)) {
		const isStart = curr.itemID == document.selection.start;
		const isEnd = curr.itemID == document.selection.end;

		if (isStart || isEnd || inRange)
			items.push(curr);

		inRange = (!inRange && (isStart || isEnd) && !(isStart && isEnd)) || (inRange && !isStart && !isEnd);
	}

	return items;
}

export function getSelectedItems(document : Document) : ItemDictionary {
	const selectionRange = getSelectionRange(document);
	let selectionDict : ItemDictionary = { }

	for (const item of selectionRange) {
		selectionDict[item.itemID] = item;
	}

	return selectionDict;
}

export function indentItem(document : Document, item : Item) : Item {
	const parent = document.items[item.parentID];
	if (!parent || parent.children.indexOf(item.itemID) <= 0)
		return item;

	const itemIndex = parent.children.indexOf(item.itemID);
	const prevSibling = document.items[parent.children[itemIndex - 1]];
	if (!prevSibling)
		return item;

	return moveItem(document, prevSibling, prevSibling.children.length, item);
}

export function unindentItem(document : Document, item : Item) : Item {
	const parent = document.items[item.parentID];
	if (!parent)
		return item;

	const grandparent = document.items[parent.parentID];
	if (!grandparent)
		return item;

	const itemIndex = parent.children.indexOf(item.itemID);
	const parentIndex = grandparent.children.indexOf(parent.itemID);

	const unindentedSiblings = parent.children.splice(itemIndex + 1);

	unindentedSiblings
		.map(childID => document.items[childID])
		.map(child => moveItem(document, document.items[item.itemID], document.items[item.itemID].children.length, child));

	return moveItem(document, grandparent, parentIndex + 1, document.items[item.itemID]);
}

export function updateItems(document : Document, ...items : Item[]) : Document {
	for (const item of items) {
		if (document.items[item.itemID] != undefined)
			document.items[item.itemID] = item;
		else if (document.items[item.parentID] != undefined)
			addItem(document, document.items[item.parentID], 0, item);
	}

	return document;
}