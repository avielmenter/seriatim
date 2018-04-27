import { Item } from './item';

export type ItemDictionary = { [itemID : string] : Item};

export interface Document {
	title : string,
	rootItemID : string,
	focusIndex : number,
	items : ItemDictionary
}
