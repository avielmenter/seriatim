import * as React from 'react';
import { connect } from 'react-redux';

import { DispatchProps, mapDispatchToProps, ApplicationState } from '../../store';

import { ListItem, CursorPosition } from '../../store/data/item';

type StateProps = {}

type AttrProps = {
	node: ListItem
}

type ComponentProps = StateProps & AttrProps & DispatchProps;

class ItemEditor extends React.Component<ComponentProps> {
	editArea: React.RefObject<HTMLTextAreaElement>;

	constructor(props: ComponentProps) {
		super(props);
		this.editArea = React.createRef<HTMLTextAreaElement>();
	}

	getTextAreaId() {
		return '__edit__' + this.props.node.item.itemID;
	}

	setSelectionRange(position?: CursorPosition): void {
		const item = this.props.node.item;

		if (this.editArea.current) {
			const selectionEnd = this.editArea.current.value.length;
			const selectionStart = this.props.node.itemType == "Title" && item.text == "Untitled Document" ? 0 : selectionEnd;

			const start = !position ? selectionStart : position.start;
			const length = !position ? selectionEnd - selectionStart : position.length;

			this.editArea.current.setSelectionRange(start, start + length);
			this.props.actions.item.updateCursor(item, {
				start,
				length
			});
		}
	}

	getCursorPosition(event: React.KeyboardEvent<HTMLTextAreaElement> | React.MouseEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLTextAreaElement>): CursorPosition | undefined {
		if (!this.editArea.current)
			return undefined;

		const item = this.props.node.item;

		const start = this.editArea.current.selectionStart;
		const length = this.editArea.current.selectionEnd - start;

		return {
			start,
			length
		};
	}

	focusOnTextArea() {
		if (this.props.node.focused && this.editArea.current)
			this.editArea.current.focus();
	}

	resizeTextArea() {
		const textArea = this.editArea.current;
		if (!textArea)
			return;

		textArea.style.height = 'auto';
		textArea.style.height = (25 + textArea.scrollHeight) + 'px';
	}

	componentDidMount() {
		this.focusOnTextArea();

		this.resizeTextArea();
		this.setSelectionRange(this.props.node.item.view.cursorPosition);
	}

	render() {
		const { item } = this.props.node;
		const { actions } = this.props;

		return (
			<textarea id={this.getTextAreaId()} className="editArea"
				onChange={(event) => {
					this.resizeTextArea();
					actions.item.updateItemText(item, event.target.value);
				}}
				onKeyUp={(event) => {
					if ((event.key < 'a' || event.key > 'z')
						&& event.key.toLowerCase() != 'backspace'
						&& event.key.toLowerCase() != 'delete'
						&& event.key != ' ') {	// only update cursor if updateItemText didn't 
						this.props.actions.item.updateCursor(item, this.getCursorPosition(event));
					} else if (!event.ctrlKey && item.view.cursorPosition && item.view.cursorPosition.length > 0) { // also update if we need to collapse the selection
						this.props.actions.item.updateCursor(item, {
							start: item.view.cursorPosition.start + item.view.cursorPosition.length,
							length: 0
						});
					}
				}}
				onClick={(event) => this.props.actions.item.updateCursor(item, this.getCursorPosition(event))}
				value={item.text}
				ref={this.editArea}
			></textarea>
		);
	}

	componentDidUpdate() {
		this.focusOnTextArea();

		const cursorPosition = this.props.node.item.view.cursorPosition;

		if (this.editArea.current && this.editArea.current.selectionStart != (!cursorPosition ? 0 : cursorPosition.start))
			this.setSelectionRange(this.props.node.item.view.cursorPosition);
	}

	componentWillUnmount() {
		this.props.actions.item.updateCursor(this.props.node.item, undefined);
	}
}

const mapStateToProps = (state: ApplicationState | {}) => ({});

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(ItemEditor);