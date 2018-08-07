import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactMarkdown from 'react-markdown';

import * as classNames from 'classnames';

import { DispatchProps, mapDispatchToProps, handleClick, ApplicationState } from '../store';

import { ListItem, CursorPosition } from '../store/data/item';

type StateProps = {
	canEdit: boolean
}

type AttrProps = {
	node: ListItem
}

type ComponentProps = StateProps & AttrProps & DispatchProps;

class ItemContent extends React.Component<ComponentProps> {
	editArea: React.RefObject<HTMLTextAreaElement>;

	constructor(props: ComponentProps) {
		super(props);
		this.editArea = React.createRef<HTMLTextAreaElement>();
	}

	getContentDivId() {
		return '__content__' + this.props.node.item.itemID;
	}

	getTextAreaId() {
		return '__edit__' + this.props.node.item.itemID;
	}

	setSelectionRange = (position?: CursorPosition): void => {
		const item = this.props.node.item;

		if (this.editArea.current) {
			const selectionEnd = this.editArea.current.value.length;
			const selectionStart = this.props.node.itemType == "Title" && item.text == "Untitled Document" ? 0 : selectionEnd;

			this.editArea.current.setSelectionRange(!position ? selectionStart : position.start, !position ? selectionEnd : position.start + position.length)
			this.props.actions.item.updateCursor(item, {
				start: !position ? selectionStart : position.start,
				length: !position ? 0 : position.start + position.length
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

	handleContentClick(event: React.MouseEvent<HTMLDivElement>): void {
		if (!this.props.canEdit)
			return;

		event.stopPropagation();
		event.preventDefault();

		const actions = this.props.actions.document;
		const item = this.props.node.item;

		if (event.shiftKey)
			actions.multiSelect(item);
		else
			actions.setFocus(item);
	}

	resizeTextArea() {
		const textArea = this.editArea.current;
		if (!textArea)
			return;

		textArea.style.height = 'auto';
		textArea.style.height = (25 + textArea.scrollHeight) + 'px';
	}

	render() {
		const node = this.props.node;
		const item = this.props.node.item;
		const actions = this.props.actions;

		const textWithoutHeader = item.text.replace(/(^#+\s+)?/, '');

		const classes = classNames({
			"itemContent": true,
			"selectedItem": node.selected
		})

		return (
			<div className={classes} id={this.getContentDivId()} onClick={(event) => this.handleContentClick(event)}>
				{node.itemType != "Title" ?
					<ReactMarkdown
						source={textWithoutHeader.length == 0 ? "New Item" : item.text}
						className={textWithoutHeader.length == 0 ? "itemContentRenderedEmpty" : "itemContentRendered"}
					/> :
					<h1 className={item.text.length == 0 ? "titleEmpty" : "title"}>{item.text.length == 0 ? "Untitled Document..." : item.text}</h1>
				}
				{node.focused &&
					<textarea id={this.getTextAreaId()} className="editArea"
						onChange={(event) => {
							this.resizeTextArea();
							actions.item.updateItemText(item, event.target.value);
						}}
						onFocus={(event) => {
							this.resizeTextArea();
							this.setSelectionRange();
						}}
						onKeyUp={(event) => this.props.actions.item.updateCursor(item, this.getCursorPosition(event))}
						onClick={(event) => this.props.actions.item.updateCursor(item, this.getCursorPosition(event))}
						onBlur={() => this.props.actions.item.updateCursor(item, undefined)}
						value={item.text}
						ref={this.editArea}
					></textarea>
				}
			</div>
		);
	}

	componentDidMount() {
		this.focusOnTextArea();
	}

	componentDidUpdate() {
		this.focusOnTextArea();

		const cursorPosition = this.props.node.item.view.cursorPosition;

		if (this.editArea.current && this.editArea.current.selectionStart != (!cursorPosition ? 0 : cursorPosition.start))
			this.setSelectionRange(this.props.node.item.view.cursorPosition);
	}
}

const mapStateToProps = (state: ApplicationState | {}) => {
	let canEdit = false;

	if (state != {}) {
		const permissions = (state as ApplicationState).permissions;
		canEdit = permissions !== null && permissions.edit;
	}

	return {
		canEdit
	}
};

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(ItemContent);