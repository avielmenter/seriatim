import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactMarkdown from 'react-markdown';

import * as classNames from 'classnames';

import { DispatchProps, mapDispatchToProps, handleClick, ApplicationState } from '../store';

import { ListItem } from '../store/data/item';

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

	setSelectionRange = (): void => {
		const item = this.props.node.item;

		if (this.editArea.current) {
			const selectionEnd = this.editArea.current.value.length;
			const selectionStart = item.view.itemType == "Title" && item.text == "Untitled Document" ? 0 : selectionEnd;

			this.editArea.current.setSelectionRange(selectionStart, selectionEnd);
		}
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
		const actions = this.props.actions.document;

		const textWithoutHeader = item.text.replace(/(^#+\s+)?/, '');

		const classes = classNames({
			"itemContent": true,
			"selectedItem": node.selected
		})

		return (
			<div className={classes} id={this.getContentDivId()} onClick={(event) => this.handleContentClick(event)}>
				{item.view.itemType != "Title" ?
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
							actions.updateItemText(item, event.target.value)
						}}
						onFocus={(event) => {
							this.resizeTextArea();
							this.setSelectionRange();
						}}
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