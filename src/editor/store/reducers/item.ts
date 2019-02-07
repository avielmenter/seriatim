import { AnyAction } from 'redux';
import { List, Map } from 'immutable';

import Style from '../data/style';
import { Item, CursorPosition, getHeaderLevel, changeStyle } from '../data/item';

// UTILITY

function escapeRegExp(text: string) { //ew. why did I have to copy this from stackoverflow
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function applyMarkdownToSubstr(item: Item, opening: string, closing: string, startSubstr: number, lenSubstr: number): Item {
	const { cursorPosition } = item.view;

	const removeMarkdown = (startSubstr >= opening.length // strip markdown if it's already there
		&& item.text.substr(startSubstr - opening.length, opening.length) == opening
		&& startSubstr + lenSubstr <= item.text.length - closing.length
		&& item.text.substr(startSubstr + lenSubstr, closing.length) == closing
	) || (
			!cursorPosition
			&& item.text.startsWith(opening)
			&& item.text.endsWith(closing)
		);

	const newText = removeMarkdown
		? (item.text.substr(0, startSubstr - opening.length)
			+ item.text.substr(startSubstr, lenSubstr)
				.replace(new RegExp(escapeRegExp(opening), 'g'), '')
				.replace(new RegExp(escapeRegExp(closing), 'g'), '')
			+ item.text.substr(startSubstr + lenSubstr + closing.length)
		)
		: (item.text.substr(0, startSubstr)
			+ opening
			+ item.text.substr(startSubstr, lenSubstr)
				.replace(/(.)\n/g, '$1' + closing + '\n')
				.replace(/\n(.)/g, '\n' + opening + '$1')	// markdown breaks if spread across multiple lines
			+ closing
			+ item.text.substr(startSubstr + lenSubstr)
		);

	const cursorStartChange = (removeMarkdown ? -1 : 1) * opening.length;
	const cursorLengthChange = (newText.length - item.text.length)
		- (removeMarkdown ? -1 : 1) * (opening.length + closing.length);

	return {
		...item,
		text: newText,
		view: {
			...item.view,
			cursorPosition: cursorPosition && {
				start: cursorPosition.start + cursorStartChange,
				length: cursorPosition.length + cursorLengthChange,
				synced: false,
			}
		}
	};
}

const wordBoundingChars = [' ', '_', '*', '[', ']'];

function getWordStart(text: string, index: number): number {
	if (index <= 0)
		return 0;

	return Math.max(
		...wordBoundingChars.map(c => text.lastIndexOf(c, index - 1) + 1)
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

function getAllIndicesOf(haystack: string, needle: string, offset: number = 0): List<number> {
	const index = haystack.indexOf(needle);

	return index == -1
		? List<number>()
		: List<number>([index + offset])
			.concat(getAllIndicesOf(haystack.substr(index + needle.length), needle, index + offset + needle.length))
			.toList();
}

function getParagraphIndices(item: Item): List<number> {
	const { cursorPosition } = item.view;

	return (!cursorPosition
		? List<number>([0])
			.concat(getAllIndicesOf(item.text, '\n'))
			.toList()
		: List<number>([Math.max(0, item.text.lastIndexOf('\n', cursorPosition.start))])
			.concat(getAllIndicesOf(item.text.substr(cursorPosition.start, cursorPosition.length), '\n', cursorPosition.start))
			.toList()
	).toSet().toList() // remove duplicates
		.sort().toList();
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

type AddImage = {
	type: "AddImage",
	data: {}
}

type BlockQuote = {
	type: "BlockQuote",
	data: {}
}

type Unquote = {
	type: "Unquote",
	data: {}
}

type ClearFormatting = {
	type: "ClearFormatting",
	data: {}
}

type UpdateCursor = {
	type: "UpdateCursor",
	data: {
		cursorPosition?: CursorPosition
	}
}

type UpdateStyle = {
	type: "UpdateStyle",
	data: {
		style: Style
	}
}

type ClearStyle = {
	type: "ClearStyle",
	data: {
		style: string
	}
}

export type Action
	= UpdateItemText
	| EmboldenItem
	| ItalicizeItem
	| AddURL
	| AddImage
	| BlockQuote
	| Unquote
	| ClearFormatting
	| UpdateCursor
	| UpdateStyle
	| ClearStyle;

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
				synced: true
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

function addImage(item: Item, action: AddImage): Item | undefined {
	return applyMarkdown(item, '![', '](https://[image-url])');
}

function blockQuote(item: Item, action: BlockQuote): Item | undefined {
	const { cursorPosition } = item.view;

	const blockQuoteMarkdown = '> ';

	const paragraphIndices = getParagraphIndices(item);

	const startBlockQuote = paragraphIndices.first(0);
	const endBlockQuote = paragraphIndices.last(0);

	const newlineOffset = endBlockQuote == 0 ? 0 : 1;

	const quotedText = item.text.substr(startBlockQuote, newlineOffset + endBlockQuote - startBlockQuote)
		.replace(/(\n)/g, '$1' + blockQuoteMarkdown);

	const newText = (startBlockQuote == 0 ? '> ' : '')
		+ item.text.substr(0, startBlockQuote)
		+ quotedText
		+ item.text.substr(endBlockQuote + newlineOffset);

	const cursorLengthChange = (paragraphIndices.count() - 1) * blockQuoteMarkdown.length;

	return {
		...item,
		text: newText,
		view: {
			...item.view,
			cursorPosition: cursorPosition && {
				start: cursorPosition.start + blockQuoteMarkdown.length,
				length: cursorPosition.length + cursorLengthChange,
				synced: false
			}
		}
	}
}

function unquote(item: Item, action: Unquote): Item | undefined {
	const { cursorPosition } = item.view;

	const blockQuoteMarkdown = '> ';
	const paragraphIndices = getParagraphIndices(item);

	const startBlockQuote = paragraphIndices.first(0);
	const endBlockQuote = paragraphIndices.last(0);

	const newlineOffset = (endBlockQuote == 0 ? 0 : 1);

	const unquotedText = item.text.substr(startBlockQuote, (endBlockQuote - startBlockQuote) + blockQuoteMarkdown.length + newlineOffset)
		.replace(/> /g, '');

	const newText = item.text.substr(0, startBlockQuote)
		+ unquotedText
		+ item.text.substr(endBlockQuote + blockQuoteMarkdown.length + newlineOffset);

	const cursorStart = cursorPosition && (cursorPosition.start - (item.text.indexOf(blockQuoteMarkdown) != -1 ? blockQuoteMarkdown.length : 0));
	const cursorLengthChange = (paragraphIndices.count() - 1) * blockQuoteMarkdown.length;

	return {
		...item,
		text: newText,
		view: {
			...item.view,
			cursorPosition: (!cursorPosition || !cursorStart) ? undefined : {
				start: cursorStart,
				length: cursorPosition.length - cursorLengthChange,
				synced: false
			}
		}
	}
}

function clearFormatting(item: Item, action: ClearFormatting): Item | undefined {
	const { cursorPosition } = item.view;

	const markdown = [
		/\*\*([^\*]*)\*\*/g, 			// bold markdown
		/_([^\_]*)_/g,  				// italicize markdown
		/!?\[([^\]]*)\]\([^\)]*\)/g, 	// image / link markdown
		/>\s()/g						// blockquote markdown
	];

	if (!cursorPosition) {
		const newText = markdown.reduce((text, md) => text.replace(md, '$1'), item.text);

		return {
			...item,
			text: newText,
			styles: Map<string, Style>()
		}
	} else if (cursorPosition.length == 0) {
		const cursor = cursorPosition.start;

		const wordStart = Math.max(0,
			item.text.lastIndexOf(' ', cursor),
			item.text.lastIndexOf('\n', cursor)
		);

		const wordEnd = Math.min(item.text.length,
			item.text.indexOf(' ', cursor) == -1 ? Infinity : item.text.indexOf(' ', cursor),
			item.text.indexOf('\n', cursor) == -1 ? Infinity : item.text.indexOf('\n', cursor)
		);

		const formatted = item.text.substr(wordStart, wordEnd - wordStart);
		const unformatted = markdown.reduce((text, md) => text.replace(md, '$1'), formatted);
		const newText = item.text.substr(0, wordStart)
			+ unformatted
			+ item.text.substr(wordEnd);

		const startChange = Math.max(formatted.trim().indexOf(unformatted.trim()), 0);

		return {
			...item,
			text: newText,
			styles: Map<string, Style>(),
			view: {
				...item.view,
				cursorPosition: {
					start: cursorPosition.start - startChange,
					length: 0,
					synced: false
				}
			}
		}
	} else {
		const formatted = item.text.substr(cursorPosition.start, cursorPosition.length);
		const unformatted = markdown.reduce((text, md) => text.replace(md, '$1'), formatted);
		const newText = item.text.substr(0, cursorPosition.start)
			+ unformatted
			+ item.text.substr(cursorPosition.start + cursorPosition.length);

		return {
			...item,
			text: newText,
			styles: Map<string, Style>(),
			view: {
				...item.view,
				cursorPosition: {
					start: cursorPosition.start,
					length: cursorPosition.length - (formatted.length - unformatted.length),
					synced: false
				}
			}
		}
	}
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

function updateStyle(item: Item, action: UpdateStyle): Item | undefined {
	return changeStyle(item, action.data.style);
}

function clearStyle(item: Item, action: ClearStyle): Item | undefined {
	return {
		...item,
		styles: item.styles.remove(action.data.style)
	};
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
		case "AddImage":
			return addImage(item, action);
		case "BlockQuote":
			return blockQuote(item, action);
		case "Unquote":
			return unquote(item, action);
		case "ClearFormatting":
			return clearFormatting(item, action);
		case "UpdateCursor":
			return updateCursor(item, action);
		case "UpdateStyle":
			return updateStyle(item, action);
		case "ClearStyle":
			return clearStyle(item, action);
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