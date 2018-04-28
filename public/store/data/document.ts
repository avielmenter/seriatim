import { Item, ItemID } from './item';

export type ItemDictionary = { [itemID : string] : Item};

export interface Document {
	title : string,
	rootItemID : ItemID,
	focusedItemID : ItemID | undefined
	items : ItemDictionary
}
