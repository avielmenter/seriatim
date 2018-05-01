import { Item, ItemID } from './item';

export type ItemDictionary = { [itemID : string] : Item};

export interface Document {
	title : string,
	rootItemID : ItemID,
	focusedItemID : ItemID | undefined
	items : ItemDictionary
}

export function copy(d : Document) : Document {
	return JSON.parse(JSON.stringify(d));
}

export function equals(lhs : any, rhs : any) : boolean {
	return JSON.stringify(lhs) == JSON.stringify(rhs);
}