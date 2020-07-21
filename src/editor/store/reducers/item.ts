import { AnyAction } from 'redux';

import { Action } from '../../io/document/reducers/item';
import { Item, CursorPosition } from '../../io/document/item';
import Style from '../../io/document/style';

// DISPATCH PROPERTIES

type Dispatch = (action: AnyAction) => void;

export const creators = (dispatch: Dispatch): DispatchProps => {
	const itemDispatch = (item: Item, action: Action): void => dispatch({
		type: "UpdateItem",
		data: {
			item,
			action
		}
	});

	const selectionDispatch = (action: Action): void => dispatch({
		type: "UpdateSelection",
		data: {
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
		emboldenItem: (item: Item) => itemDispatch(
			item, {
			type: "EmboldenItem",
			data: {}
		}
		),
		emboldenSelection: () => selectionDispatch({
			type: "EmboldenItem",
			data: {}
		}),
		italicizeItem: (item: Item) => itemDispatch(
			item, {
			type: "ItalicizeItem",
			data: {}
		}
		),
		italicizeSelection: () => selectionDispatch({
			type: "ItalicizeItem",
			data: {}
		}),
		addURL: (item: Item) => itemDispatch(
			item, {
			type: "AddURL",
			data: {}
		}
		),
		addImage: (item: Item) => itemDispatch(
			item, {
			type: "AddImage",
			data: {}
		}
		),
		blockQuote: (item: Item) => itemDispatch(
			item, {
			type: "BlockQuote",
			data: {}
		}
		),
		blockQuoteSelection: () => selectionDispatch({
			type: "BlockQuote",
			data: {}
		}),
		unquote: (item: Item) => itemDispatch(
			item, {
			type: "Unquote",
			data: {}
		}
		),
		unquoteSelection: () => selectionDispatch({
			type: "Unquote",
			data: {}
		}),
		clearFormatting: (item: Item) => itemDispatch(
			item, {
			type: "ClearFormatting",
			data: {}
		}
		),
		clearSelectionFormatting: () => selectionDispatch({
			type: "ClearFormatting",
			data: {}
		}),
		updateCursor: (item: Item, cursorPosition?: CursorPosition) => itemDispatch(
			item, {
			type: "UpdateCursor",
			data: {
				cursorPosition
			}
		}
		),
		updateStyle: (item: Item, style: Style) => itemDispatch(
			item, {
			type: "UpdateStyle",
			data: { style }
		}
		),
		updateSelectionStyles: (style: Style) => selectionDispatch({
			type: "UpdateStyle",
			data: { style }
		}),
		clearStyle: (item: Item, style: string) => itemDispatch(
			item, {
			type: "ClearStyle",
			data: { style }
		}
		),
		clearSelectionStyles: (style: string) => selectionDispatch({
			type: "ClearStyle",
			data: { style }
		})
	}
};

export type DispatchProps = {
	updateItemText: (item: Item, newText: string) => void,
	emboldenItem: (item: Item) => void,
	emboldenSelection: () => void,
	italicizeItem: (item: Item) => void,
	italicizeSelection: () => void,
	addURL: (item: Item) => void,
	addImage: (item: Item) => void,
	blockQuote: (item: Item) => void,
	blockQuoteSelection: () => void,
	unquote: (item: Item) => void,
	unquoteSelection: () => void,
	clearFormatting: (item: Item) => void,
	clearSelectionFormatting: () => void,
	updateCursor: (item: Item, cursorPosition?: CursorPosition) => void,
	updateStyle: (item: Item, style: Style) => void,
	updateSelectionStyles: (style: Style) => void,
	clearStyle: (item: Item, style: string) => void,
	clearSelectionStyles: (style: string) => void,
}