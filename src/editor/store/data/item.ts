import { List, Set } from 'immutable';

export type ItemID = string;
export type ItemType = "Header" | "Item" | "Title";

export type Item = {
	readonly itemID: ItemID,
	readonly parentID: ItemID,
	readonly text: string,
	readonly children: List<ItemID>,
	readonly view: {
		readonly collapsed: boolean
	}
}

export type ListItem = {
	readonly item: Item,
	readonly focused: boolean,
	readonly selected: boolean,
	readonly indent: number,
	readonly itemType: ItemType,
}

const ID_POOL_SIZE = 1000;
let ID_POOL = Set<ItemID>();

function __generateItemID(): ItemID { 	// copied from https://stackoverflow.com/a/105074 
	function s4(): string {			// NOT GUARANTEED TO BE GLOBALLY UNIQUE
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}

	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function refreshIDPool(): void {
	if (ID_POOL.count() > ID_POOL_SIZE / 2)
		return;

	while (ID_POOL.count() < ID_POOL_SIZE)
		ID_POOL = ID_POOL.add(__generateItemID());
}

function generateItemID(): ItemID {
	refreshIDPool();

	const newID = ID_POOL.first();
	ID_POOL = ID_POOL.remove(newID);

	return newID;
}

export function newItemFromParent(parent: Item): Item {
	return {
		itemID: generateItemID(),
		parentID: parent.itemID,
		text: "",
		children: List<ItemID>([]),
		view: {
			collapsed: false
		}
	}
}

export function regenerateID(item: Item): Item {
	return {
		...item,
		itemID: generateItemID()
	}
}