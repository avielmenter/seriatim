import { Item, ItemID } from './item';

export type ItemDictionary = { [itemID : string] : Item};

export interface Document {
	title : string,
	rootItemID : ItemID,
	focusedItemID : ItemID | undefined,
	items : ItemDictionary
}

export function copyDocument(d : Document) : Document {
	return JSON.parse(JSON.stringify(d));
}

export function equals(lhs : any, rhs : any) : boolean {
	return JSON.stringify(lhs) == JSON.stringify(rhs);
}

export function getLastItem(document : Document, curr : Item) : Item {
	if (curr.children.length == 0)
		return curr;

	const lastChild = document.items[curr.children[curr.children.length - 1]];
	if (!lastChild)
		return curr;
	return getLastItem(document, lastChild); 
}