import { Item, ItemID, ItemTree, newItemFromParent, regenerateID } from './item';
import { Map, List } from 'immutable';

export type ItemDictionary = Map<ItemID, Item>;

type SelectionRange = {
	readonly start: ItemID,
	readonly end: ItemID
}

export interface Document {
	readonly title: string,
	readonly rootItemID: ItemID,
	readonly focusedItemID: ItemID | undefined,
	readonly selection: SelectionRange | undefined,
	readonly items: ItemDictionary,
	readonly clipboard: Document | undefined
}

export function copySubtree(d: Document, root: Item): ItemDictionary {
	const childSubtrees = root.children
		.map(childID => d.items.get(childID))
		.filter(child => child != undefined)
		.map(child => copySubtree(d, child));

	const subtree = Map<ItemID, Item>({
		[root.itemID]: root
	});

	return subtree.merge(...childSubtrees.toArray());
}

export function regenerateIDs(d: Document, curr: Item | undefined = d.items.get(d.rootItemID), newIDs: Map<ItemID, ItemID> | undefined = undefined, parent: Item | undefined = undefined): Document {
	if (!curr)
		return d;

	let newItem = newIDs && newIDs.get(curr.itemID)
		? { ...curr, itemID: newIDs.get(curr.itemID) }
		: regenerateID(curr);

	let newSelection = d.selection ? { start: d.selection.start, end: d.selection.end } : undefined;
	let newFocus = d.focusedItemID;
	let newRoot = d.rootItemID;

	if (d.selection && newSelection && curr.itemID == d.selection.start)
		newSelection.start = newItem.itemID;
	if (d.selection && newSelection && curr.itemID == d.selection.end)
		newSelection.end = newItem.itemID;
	if (d.focusedItemID && curr.itemID == d.focusedItemID)
		newFocus = newItem.itemID;
	if (d.rootItemID == curr.itemID)
		newRoot = newItem.itemID;

	let newParent = parent;

	if (parent && newParent) {
		const itemIndex = parent.children.indexOf(curr.itemID);
		newParent = {
			...newParent,
			children: newParent.children.set(itemIndex, newItem.itemID)
		}
	}

	let newItems = d.items.set(newItem.itemID, newItem);
	if (newItem.itemID != curr.itemID)
		newItems = newItems.remove(curr.itemID);

	newItems = newItem.children.reduce((prev, i) => prev.set(i, { ...prev.get(i), parentID: newItem.itemID }), newItems);
	if (newParent)
		newItems = newItems.set(newItem.parentID, newParent);

	const newDoc: Document = {
		selection: newSelection,
		focusedItemID: newFocus,
		rootItemID: newRoot,
		items: newItems,
		title: d.title,
		clipboard: d.clipboard
	}

	return newItem.children.reduce((prev, i) => regenerateIDs(prev, prev.items.get(i), newIDs, prev.items.get(newItem.itemID)), newDoc);
}

export function equals(lhs: any, rhs: any): boolean {
	return JSON.stringify(lhs) == JSON.stringify(rhs);
}

export function getEmptyDocument(): Document {
	let document: Document = {
		title: "Untitled Document",
		rootItemID: "root",
		focusedItemID: "root",
		selection: undefined,
		items: Map<ItemID, Item>({
			"root": {
				itemID: "root",
				text: "Untitled Document",
				parentID: "",
				children: List<ItemID>(),
				view: {
					itemType: "Title",
					collapsed: false
				}
			}
		}),
		clipboard: undefined
	};

	return addItem(document, document.items.get(document.rootItemID));
}

export function getParent(document: Document, curr: Item): Item | undefined {
	const parent = document.items.get(curr.parentID);
	return !parent ? undefined : parent;
}

export function getLastItem(document: Document, curr: Item = document.items.get(document.rootItemID), skipInvisible: boolean = false): Item {
	if (curr.children.count() == 0 || (skipInvisible && curr.view.collapsed))
		return curr;

	const lastChild = document.items.get(curr.children.get(-1));
	if (!lastChild)
		return curr;
	return getLastItem(document, lastChild, skipInvisible);
}

export function getNextItem(document: Document, curr: Item, skipInvisible: boolean = false, prevIndex: number = -1): Item | undefined {
	if (curr.children.count() > prevIndex + 1 && (!skipInvisible || !curr.view.collapsed))
		return document.items.get(curr.children.get(prevIndex + 1));

	const currParent: Item = document.items.get(curr.parentID);
	if (!currParent)
		return undefined;

	const currIndex = currParent.children.indexOf(curr.itemID);
	return getNextItem(document, currParent, skipInvisible, currIndex);
}

export function getPrevItem(document: Document, curr: Item, skipInvisible: boolean = false): Item | undefined {
	const parent = document.items.get(curr.parentID);
	if (!parent)
		return undefined;

	const currIndex = parent.children.indexOf(curr.itemID);
	return currIndex > 0 ? getLastItem(document, document.items.get(parent.children.get(currIndex - 1)), skipInvisible) : parent;
}

export function getNextSibling(document: Document, curr: Item): Item | undefined {
	const parent = document.items.get(curr.parentID);
	if (!parent)
		return undefined;

	const childIndex = parent.children.indexOf(curr.itemID);
	if (childIndex < 0 || childIndex >= parent.children.count() - 1)
		return undefined;

	return document.items.get(parent.children.get(childIndex + 1));
}

export function getPrevSibling(document: Document, curr: Item): Item | undefined {
	const parent = document.items.get(curr.parentID);
	if (!parent)
		return undefined;

	const childIndex = parent.children.indexOf(curr.itemID);
	if (childIndex <= 0)
		return undefined;

	return document.items.get(parent.children.get(childIndex - 1));
}

export function getFirstItem(document: Document): Item {
	return document.items.get(document.rootItemID);
}

export function removeItem(document: Document, item: Item, cascade: boolean = true): Document {
	const parent = document.items.get(item.parentID);
	let newItems = document.items;

	if (parent && parent.children.contains(item.itemID)) {
		const itemIndex = parent.children.indexOf(item.itemID);
		newItems = newItems.set(item.parentID, {
			...parent,
			children: parent.children.remove(itemIndex)
		})
	}

	if (cascade) {
		newItems = newItems.merge(
			item.children
				.map(childID => document.items.get(childID))
				.filter(child => child != undefined)
				.reduce((prev, curr) => ({
					...prev,
					items: prev.items.merge(removeItem(prev, curr, cascade).items)
				}), document)
				.items
		);
	}

	return {
		...document,
		items: newItems.remove(item.itemID)
	};
}

export function addItem(document: Document, parent: Item, at: number = 0, item: Item | undefined = undefined): Document {
	const childIndex = Math.min(Math.max(at, 0), parent.children.count());
	const child = item != undefined ? { ...item, parentID: parent.itemID } : newItemFromParent(parent);

	return {
		...document,
		items: document.items
			.set(child.itemID, child)
			.set(parent.itemID, {
				...parent,
				children: parent.children.insert(childIndex, child.itemID)
			})
	}
}

export function moveItem(document: Document, newParent: Item, at: number = 0, item: Item): { document: Document, moved: Item } {
	const parent = document.items.get(item.parentID);
	if (!parent)
		return { document, moved: item };

	const childIndex = Math.min(Math.max(at, 0), newParent.children.count());

	const newItem = { ...item, parentID: newParent.itemID };
	const itemIndex = parent.children.indexOf(item.itemID);

	const newItems = document.items
		.set(newItem.parentID, {
			...newParent,
			children: newParent.children.insert(childIndex, newItem.itemID)
		})
		.set(item.parentID, {
			...parent,
			children: parent.children.remove(itemIndex)
		})
		.set(newItem.itemID, newItem)

	return {
		document: {
			...document,
			items: newItems
		},
		moved: newItem
	}
}

export function getItemIndex(document: Document, item: Item): number {
	const parent = document.items.get(item.parentID);
	if (!parent)
		return 0;

	return parent.children.indexOf(item.itemID);
}

export function getSelectionRange(document: Document): List<Item> {
	if (!document.selection)
		return List<Item>();

	let inRange = false;
	let items = List<Item>();

	for (let curr: Item | undefined = document.items.get(document.rootItemID); curr != undefined; curr = getNextItem(document, curr)) {
		const isStart = curr.itemID == document.selection.start;
		const isEnd = curr.itemID == document.selection.end;

		if (isStart || isEnd || inRange)
			items = items.push(curr);

		inRange = (!inRange && (isStart || isEnd) && !(isStart && isEnd)) || (inRange && !isStart && !isEnd);
	}

	return items;
}

export function getSelectedItems(document: Document): ItemDictionary {
	const selectionRange = getSelectionRange(document);

	return Map<ItemID, Item>(
		selectionRange.map(item => [
			!item ? '' : item.itemID,
			item
		]
		));
}

// returns the common parent of all selected items. This parent may also have non-selected children
export function getSelectionParent(document: Document, curr: Item = document.items.get(document.rootItemID), selectedItems: ItemDictionary = getSelectedItems(document)): Item | undefined {
	if (selectedItems.has(curr.itemID))
		return curr;
	else if (curr.children.count() == 0)
		return undefined;

	const children = curr.children
		.map(childID => getSelectionParent(document, document.items.get(childID), selectedItems))
		.filter(child => child != undefined);

	const childInSelectionTree: number = children.reduce((prev, curr) => prev + 1, 0);

	if (childInSelectionTree == 0)
		return undefined;
	else if (childInSelectionTree > 1)
		return curr;

	return getSelectionParent(document, children.get(0), selectedItems);
}

export function indentItem(document: Document, item: Item): { document: Document, moved: Item } {
	const parent = document.items.get(item.parentID);
	if (!parent || parent.children.indexOf(item.itemID) <= 0)
		return { document, moved: item };

	const itemIndex = parent.children.indexOf(item.itemID);
	const prevSibling = document.items.get(parent.children.get(itemIndex - 1));
	if (!prevSibling)
		return { document, moved: item };

	return moveItem(document, prevSibling, prevSibling.children.count(), item);
}

export function unindentItem(document: Document, item: Item): { document: Document, moved: Item } {
	const parent = document.items.get(item.parentID);
	if (!parent)
		return { document, moved: item };

	const grandparent = document.items.get(parent.parentID);
	if (!grandparent)
		return { document, moved: item };

	const itemIndex = parent.children.indexOf(item.itemID);
	const parentIndex = grandparent.children.indexOf(parent.itemID);

	const leftoverSiblings = parent.children.slice(0, itemIndex + 1);
	const unindentedSiblings = parent.children.slice(itemIndex + 1);

	let newDocument: Document = unindentedSiblings
		.map(childID => document.items.get(childID))
		.filter(child => child != undefined)
		.reduce((prev: Document, curr: Item) => ({
			...prev,
			items: moveItem(prev, prev.items.get(item.itemID), document.items.get(item.itemID).children.count(), curr).document.items
		}), document);

	newDocument = {
		...newDocument,
		items: newDocument.items.set(parent.itemID, { ...parent, children: leftoverSiblings.toList() })
	};

	return moveItem(newDocument, grandparent, parentIndex + 1, newDocument.items.get(item.itemID));
}

export function updateItems(document: Document, ...items: Item[]): Document {
	let newItems = document.items;

	for (const item of items) {
		if (document.items.get(item.itemID) != undefined)
			newItems = newItems.set(item.itemID, item);
		else if (document.items.get(item.parentID) != undefined)
			newItems = addItem(document, document.items.get(item.parentID), 0, item).items;
	}

	return {
		...document,
		items: newItems
	}
}

export function toItemTree(document: Document, selectedItems: ItemDictionary = getSelectedItems(document), nodeID: ItemID = document.rootItemID): ItemTree {
	const rootItem = document.items.get(nodeID);

	const nodeChildren = rootItem.children.map(child => toItemTree(document, selectedItems, child));

	return {
		item: rootItem,
		focused: document.focusedItemID == nodeID,
		selected: selectedItems.has(nodeID),
		children: nodeChildren.toList()
	};
}

export function updateItemIDs(document: Document, newIDs: Map<ItemID, ItemID>): Document {
	return regenerateIDs(document, document.items.get(document.rootItemID), newIDs);
}