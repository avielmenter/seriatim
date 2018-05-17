import { List } from 'immutable';

export type ItemID = string;
export type ItemType = "Header" | "Item" | "Title";

export type Item = {
	readonly itemID : ItemID,
	readonly parentID : ItemID,
	readonly text : string,
	readonly children : List<ItemID>,
	readonly view: {
		readonly itemType : ItemType,
		readonly collapsed : boolean
	}
}


export interface ItemTree {
	readonly item : Item,
	readonly focused : boolean,
	readonly selected : boolean,
	readonly children : List<ItemTree>
}

function generateItemID() : ItemID { 	// copied from https://stackoverflow.com/a/105074 
	function s4() : string {			// NOT GUARANTEED TO BE GLOBALLY UNIQUE
		return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);
	}

	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export function newItemFromParent(parent : Item) : Item {
	return {
		itemID: generateItemID(),
		parentID: parent.itemID,
		text: "",
		children: List<ItemID>([]),
		view: {
			itemType: "Item",
			collapsed: false
		}
	}
}

export function copyItem(item : Item, replaceID : boolean = false) : Item {
	return {
		...item,
		itemID: replaceID ? generateItemID() : item.itemID,
		view: {
			...item.view
		}
	}
}