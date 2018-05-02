export type ItemID = string;
export type ItemType = "Header" | "Item" | "Title";

export interface Item {
	itemID : ItemID,
	parentID : ItemID,
	text : string,
	children : ItemID[],
	view: {
		itemType : ItemType,
		collapsed : boolean,
		focused : boolean
	}
}

export interface ItemTree {
	item : Item,
	children : ItemTree[]
}