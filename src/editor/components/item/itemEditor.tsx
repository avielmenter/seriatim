import * as React from 'react';
import { connect } from 'react-redux';

import { DispatchProps, mapDispatchToProps, ApplicationState, handleClick } from '../../store';

import { ListItem, CursorPosition } from '../../io/document/item';

type StateProps = {}

type AttrProps = {
	node: ListItem
}

type ComponentProps = StateProps & AttrProps & DispatchProps;

function getCursorPosition(
	event: React.KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLTextAreaElement>,
	editArea: React.RefObject<HTMLTextAreaElement>
): CursorPosition | undefined {
	if (!editArea.current)
		return undefined;

	const start = editArea.current.selectionStart;
	const length = editArea.current.selectionEnd - start;

	return {
		start: start + length,
		length: 0,
		synced: true
	};
}

function resizeTextArea(editArea: React.RefObject<HTMLTextAreaElement>) {
	const textArea = editArea.current;
	if (!textArea)
		return;

	textArea.style.height = 'auto';
	textArea.style.height = (25 + textArea.scrollHeight) + 'px';
}

function setEditorSelection(editArea: HTMLTextAreaElement, position: CursorPosition | undefined, isEmptyTitle: boolean) {
	const selectionEnd = editArea.value.length;
	const selectionStart = isEmptyTitle ? 0 : selectionEnd;

	const start = !position ? selectionStart : position.start;
	const length = !position ? selectionEnd - selectionStart : position.length;

	editArea.setSelectionRange(start, start + length);
};

function shouldCursorUpdate(event: React.KeyboardEvent<HTMLTextAreaElement>): boolean {
	return (event.key < 'a' || event.key > 'z' || event.ctrlKey)
		&& event.key.toLowerCase() != 'backspace'
		&& event.key.toLowerCase() != 'delete'
		&& event.key != ' ';
}

const ItemEditor: React.SFC<ComponentProps> = (props) => {
	const { item } = props.node;
	const { actions } = props;

	const isEmptyTitle = props.node.itemType == "Title" && item.text == "Untitled Document";

	const editArea: React.RefObject<HTMLTextAreaElement> = React.useRef<HTMLTextAreaElement>(null);

	const onFocus = () => {
		resizeTextArea(editArea);

		if (props.node.focused && editArea.current) {
			editArea.current.focus();
			setEditorSelection(editArea.current, props.node.item.view.cursorPosition, isEmptyTitle);
		}
	}

	const onUnfocus = () => { actions.item.updateCursor(item, undefined); };

	React.useEffect(() => {
		onFocus();
		return onUnfocus();
	}, [props.node.focused]);

	React.useEffect(() => {
		const position = props.node.item.view.cursorPosition;

		if (!editArea.current ||
			!position ||
			position.synced)
			return;

		setEditorSelection(editArea.current, position, isEmptyTitle);
	}, [item.view.cursorPosition]);

	return (
		<textarea id={'__edit__' + item.itemID} className="editArea"
			onChange={(event) => {
				resizeTextArea(editArea);
				actions.item.updateItemText(item, event.target.value);
			}}
			onKeyUp={(event) => {
				if (shouldCursorUpdate(event)) {	// only update cursor if updateItemText didn't 
					props.actions.item.updateCursor(item, getCursorPosition(event, editArea));
				} else if (!event.ctrlKey && item.view.cursorPosition && item.view.cursorPosition.length > 0) { // also update if we need to collapse the selection
					props.actions.item.updateCursor(item, {
						start: item.view.cursorPosition.start + item.view.cursorPosition.length,
						length: 0,
						synced: true
					});
				}
			}}
			onClick={handleClick((event) => props.actions.item.updateCursor(item, getCursorPosition(event, editArea)))}
			value={item.text}
			ref={editArea}
		></textarea>
	);
}

const mapStateToProps = (state: ApplicationState | {}) => ({});

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(ItemEditor);