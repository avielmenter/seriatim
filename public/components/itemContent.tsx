import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactMarkdown from 'react-markdown';

import { DispatchProps, mapDispatchToProps } from '../store';

import { ItemTree } from '../store/data/item';

type DataProps = {
	node : ItemTree
}

type ComponentProps = DataProps & DispatchProps;

class ItemContent extends React.Component<ComponentProps> {
	editArea : React.RefObject<HTMLTextAreaElement>;

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

	handleKeyDown = (event : React.KeyboardEvent<HTMLTextAreaElement>) : void => {
		let preventDefault : boolean = true;

		const node = this.props.node;
		const item = node.item;
		const actions = this.props.actions.document;

		if (!event.ctrlKey) {
			switch (event.key.toLowerCase()) {
				case 'esc':
				case 'escape':
					actions.setFocus(undefined);
					break;
					
				default:
					preventDefault = false;
					break;
			}
		}
		else  {
			switch (event.key.toLowerCase()) {
				case '[':
					actions.unindentItem(item);
				break;

				case ']':
					actions.indentItem(item);
				break;

				case ' ':
					if (node.children.length > 0 || item.view.collapsed)
						actions.toggleItemCollapse(item);
					break;
				
				case 'return':
				case 'enter':
					if (event.shiftKey) {
						actions.addItemToParent(item);
						actions.incrementFocus(false);
					} else {
						actions.addItemAfterSibling(item, true);
					}
					break;

				case 'del':
				case 'delete':
				case 'back':
				case 'backspace':
					actions.removeItem(item);
					break;

				default:
					preventDefault = false;
					break;
			}
		}

		if (preventDefault)
			event.preventDefault();
	}

	setSelectionRange = () : void => {
		const item = this.props.node.item;

		if (this.editArea.current) {
			const selectionEnd = this.editArea.current.value.length;
			const selectionStart = item.view.itemType == "Title" && item.text == "Untitled Document" ? 0 : selectionEnd;

			this.editArea.current.setSelectionRange(selectionStart, selectionEnd);
		}
	}

	onEditAreaBlur = () : void => {
		//if (this.props.node.item.view.focused)
		//	this.props.actions.document.setFocus(undefined);
	}

	focusOnTextArea() {
		if (this.props.node.item.view.focused && this.editArea.current) 
			this.editArea.current.focus();
	}

	render() {
		const node = this.props.node;
		const item = this.props.node.item;
		const actions = this.props.actions.document;

		return (
			<div className="itemContent" id={this.getContentDivId()} onClick={() => actions.setFocus(node.item)}>
				{item.view.itemType != "Title" ? 
					<ReactMarkdown 
						source={item.text.length == 0 ? "New Item" : item.text}
						className={item.text.length == 0 ? "itemContentRenderedEmpty" : "itemContentRendered"}
					/> :
					<h1 className="title">{item.text}</h1>
				}
				{item.view.focused && 
					<textarea id={this.getTextAreaId()} className="editArea"
						onChange={(event) => actions.updateItemText(item, event.target.value)}
						onBlur={this.onEditAreaBlur}
						onFocus={this.setSelectionRange}
						onKeyDown={this.handleKeyDown}
						value={item.text}
						ref={this.editArea}
					></textarea>
				}
			</div>
		);
	}
	//*
	componentDidMount() {
		this.focusOnTextArea();
	}

	componentDidUpdate() {
		this.focusOnTextArea();
	} //*/
}

const mapStateToProps = (state : any) => ({});
export default connect<{}, DispatchProps, DataProps>(mapStateToProps, mapDispatchToProps)(ItemContent);