export type ItemID = string;
export type ItemType = "Header" | "Item" | "Title";

export interface Item {
	itemID : ItemID,
	parentID : ItemID,
	text : string,
	children : ItemID[],
	itemType : ItemType,
	view : {
		collapsed : boolean,
		focused : boolean
	}
}

export interface ItemTree {
	item : Item,
	children : ItemTree[]
}