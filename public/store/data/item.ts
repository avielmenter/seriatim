export type ItemID = string;
export type ItemType = "Header" | "Item" | "Title";

export interface Item {
	itemID : ItemID,
	parentID : ItemID,
	text : string,
	children : ItemID[],
	view: {
		itemType : ItemType,
		collapsed : boolean
	}
}

export interface ItemTree {
	item : Item,
	focused : boolean,
	selected : boolean,
	children : ItemTree[]
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
		children: [],
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