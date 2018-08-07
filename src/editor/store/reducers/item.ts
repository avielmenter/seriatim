import { AnyAction } from 'redux';
import { Item, CursorPosition, getHeaderLevel } from '../data/item';

// UTILITY

function applyMarkdownToSubstr(item: Item, opening: string, closing: string, startSubstr: number, lenSubstr: number): Item {
	const { cursorPosition } = item.view;

	const removeMarkdown = (startSubstr >= opening.length // strip markdown if it's already there
		&& item.text.substr(startSubstr - opening.length, opening.length) == opening
		&& startSubstr + lenSubstr <= item.text.length - closing.length
		&& item.text.substr(startSubstr + lenSubstr, closing.length) == closing
	);

	const newText = removeMarkdown
		? (item.text.substr(0, startSubstr - opening.length)
			+ item.text.substr(startSubstr, lenSubstr)
			+ item.text.substr(startSubstr + lenSubstr + closing.length)
		)
		: (item.text.substr(0, startSubstr)
			+ opening
			+ item.text.substr(startSubstr, lenSubstr)
			+ closing
			+ item.text.substr(startSubstr + lenSubstr)
		);

	return {
		...item,
		text: newText,
		view: {
			...item.view,
			cursorPosition: cursorPosition && {
				...cursorPosition,
				start: cursorPosition.start + (removeMarkdown ? -1 : 1) * opening.length
			}
		}
	};
}

const wordBoundingChars = [' ', '_', '*', '[', ']'];

function getWordStart(text: string, index: number): number {
	if (index <= 0)
		return 0;

	return Math.max(
		...wordBoundingChars.map(c => text.lastIndexOf(c, index) + 1)
	);
}

function getWordEnd(text: string, index: number): number {
	if (index >= text.length)
		return text.length;

	return Math.min(
		...wordBoundingChars
			.map(c => text.indexOf(c, index))
			.map(i => i == -1 ? Infinity : i)
	);
}

function applyMarkdown(item: Item, opening: string, closing: string): Item {
	const { cursorPosition } = item.view;

	if (!cursorPosition) { // apply markdown to entire item (minus header '#'s)
		const startSubstr = getHeaderLevel(item) == 0
			? 0
			: getHeaderLevel(item) + 1; // add one character to accommodate necessary space

		return applyMarkdownToSubstr(item, opening, closing, startSubstr, item.text.length - startSubstr);
	} else if (cursorPosition.length == 0) { // apply markdown to the word the cursor is over 
		const startSubstr = getWordStart(item.text, cursorPosition.start);
		const lenSubstr = getWordEnd(item.text, cursorPosition.start) - startSubstr;

		return applyMarkdownToSubstr(item, opening, closing, startSubstr, lenSubstr);
	} else { // apply markdown around selected text
		const startSubstr = Math.min(Math.max(cursorPosition.start, 0), item.text.length - 1);
		const lenSubstr = Math.max(Math.min(item.text.length - startSubstr, cursorPosition.length), 0);

		return applyMarkdownToSubstr(item, opening, closing, startSubstr, lenSubstr);
	}
}

// ACTION TYPES

type UpdateItemText = {
	type: "UpdateItemText",
	data: {
		newText: string
	}
}

type EmboldenItem = {
	type: "EmboldenItem",
	data: {}
}

type ItalicizeItem = {
	type: "ItalicizeItem",
	data: {}
}

type AddURL = {
	type: "AddURL",
	data: {}
}

type BlockQuote = {
	type: "BlockQuote",
	data: {}
}

type UpdateCursor = {
	type: "UpdateCursor",
	data: {
		cursorPosition?: CursorPosition
	}
}

export type Action
	= UpdateItemText
	| EmboldenItem
	| ItalicizeItem
	| AddURL
	| BlockQuote
	| UpdateCursor;

// REDUCERS

function updateItemText(item: Item, action: UpdateItemText): Item | undefined {
	const { newText } = action.data;

	const charsAdded = newText.length - item.text.length;
	const cursorPosition = item.view.cursorPosition;

	const newItem: Item = {
		...item,
		text: newText,
		view: {
			...item.view,
			cursorPosition: cursorPosition && {
				...cursorPosition,
				start: Math.min(newText.length, Math.max(0, cursorPosition.start + charsAdded)),
			}
		}
	};

	return newItem;
}

function emboldenItem(item: Item, action: EmboldenItem): Item | undefined {
	return applyMarkdown(item, '**', '**');
}

function italicizeItem(item: Item, action: ItalicizeItem): Item | undefined {
	return applyMarkdown(item, '_', '_');
}

function addURL(item: Item, action: AddURL): Item | undefined {
	return applyMarkdown(item, '[', '](https://)');
}

function updateCursor(item: Item, action: UpdateCursor): Item | undefined {
	return {
		...item,
		view: {
			...item.view,
			cursorPosition: action.data.cursorPosition
		}
	}
}

export function reducer(item: Item, anyAction: AnyAction): Item | undefined {
	const action = anyAction as Action;

	switch (action.type) {
		case "UpdateItemText":
			return updateItemText(item, action);
		case "EmboldenItem":
			return emboldenItem(item, action);
		case "ItalicizeItem":
			return italicizeItem(item, action);
		case "AddURL":
			return addURL(item, action);
		case "UpdateCursor":
			return updateCursor(item, action);
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
		emboldenItem: (item: Item) => itemDispatch(
			item, {
				type: "EmboldenItem",
				data: {}
			}
		),
		italicizeItem: (item: Item) => itemDispatch(
			item, {
				type: "ItalicizeItem",
				data: {}
			}
		),
		addURL: (item: Item) => itemDispatch(
			item, {
				type: "AddURL",
				data: {}
			}
		),
		updateCursor: (item: Item, cursorPosition?: CursorPosition) => itemDispatch(
			item, {
				type: "UpdateCursor",
				data: {
					cursorPosition
				}
			}
		),
	}
};

export type DispatchProps = {
	updateItemText: (item: Item, newText: string) => void,
	emboldenItem: (item: Item) => void,
	italicizeItem: (item: Item) => void,
	addURL: (item: Item) => void,
	updateCursor: (item: Item, cursorPosition?: CursorPosition) => void,
}