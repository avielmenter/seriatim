import { AnyAction } from 'redux';

import { Item } from '../data/item';

// ACTION TYPES

type UpdateItemText = {
	type: "UpdateItemText",
	data: {
		newText: string
	}
}

export type Action = UpdateItemText;

// REDUCERS

function updateItemText(item: Item, action: UpdateItemText): Item | undefined {
	const { newText } = action.data;
	const newType = (newText.match(/\s*#+\s+.*/) ? "Header" : "Item");

	const newItem: Item = {
		...item,
		text: newText,
	};

	return newItem;
}

export function reducer(item: Item, anyAction: AnyAction): Item | undefined {
	const action = anyAction as Action;

	switch (action.type) {
		case "UpdateItemText":
			return updateItemText(item, action);
		default:
			return undefined;
	}
}

// DISPATCH PROPERTIES

type Dispatch = (action: AnyAction) => void;

export const creators = (dispatch: Dispatch) => {
	const itemDispatch = (item: Item, action: Action): void => dispatch({
		type: "UpdateItem",
		data: {
			item,
			action
		}
	});

	return {
		updateItemText: (item: Item, newText: string) => itemDispatch(
			item, {
				type: "UpdateItemText",
				data: { newText }
			}
		),
	}
};

export type DispatchProps = {
	updateItemText: (item: Item, newText: string) => void,
}