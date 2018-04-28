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
	constructor(props: ComponentProps) {
		super(props);
	}

	getContentDivId() {
		return '__content__' + this.props.node.item.itemID;
	}

	getTextAreaId() {
		return '__edit__' + this.props.node.item.itemID;
	}

	handleKeyDown(event : React.KeyboardEvent<HTMLTextAreaElement>) : void {
		let preventDefault : boolean = true;

		const node = this.props.node;
		const item = node.item;
		const actions = this.props.actions.document;

		if (event.key.toLowerCase().startsWith('esc') || event.keyCode == 27) {
			actions.setFocus(undefined);
		}
		else if (event.shiftKey && event.key.toLowerCase().startsWith('tab')) {
			actions.decrementFocus();
		}
		else if (event.key.toLowerCase().startsWith('tab')) {
			actions.incrementFocus(true);
		}
		else if (event.ctrlKey && event.key == '[') {
			actions.unindentItem(item);
		}
		else if (event.ctrlKey && event.key == ']') {
			actions.indentItem(item);
		}
		else if (event.ctrlKey && event.key == ' ') {
			if (node.children.length > 0 || item.view.collapsed)
				actions.toggleItemCollapse(item);
		}
		else if (event.ctrlKey && (event.key.toLowerCase().startsWith('return') || event.key.toLowerCase().startsWith('enter'))) {
			if (event.shiftKey)
				actions.addItemToParent(item);
			else if (item.itemType != "Title")
				actions.addItemAfterSibling(item);
		}
		else {
			preventDefault = false;
		}

		if (preventDefault)
			event.preventDefault();
	}

	onFocus(event : React.FocusEvent<HTMLTextAreaElement>) : void {
		event.target.setSelectionRange(event.target.value.length, event.target.value.length);
	}

	onBlur() {
		//if (this.props.node.item.view.focused)
		//	this.props.actions.document.setFocus(undefined);
	}

	focusOnTextArea() {
		const editArea = document.getElementById(this.getTextAreaId());

		if (this.props.node.item.view.focused && editArea)
			editArea.focus();
	}

	render() {
		const node = this.props.node;
		const item = this.props.node.item;
		const actions = this.props.actions.document;

		return (
			<div className="itemContent" id={this.getContentDivId()} onClick={() => actions.setFocus(node.item)}>
				{item.itemType != "Title" ? 
					<ReactMarkdown 
						source={item.text.length == 0 ? "New Item" : item.text}
						className={item.text.length == 0 ? "itemContentRenderedEmpty" : "itemContentRendered"}
					/> :
					<h1 className="title">{item.text}</h1>
				}
				{item.view.focused && 
					<textarea id={this.getTextAreaId()} className="editArea"
						onChange={(event) => actions.updateItemText(item, event.target.value)}
						onFocus={(event) => this.onFocus(event)}
						onBlur={() => this.onBlur()}
						onKeyDown={(event) => this.handleKeyDown(event)}
						value={item.text}
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

const mapStateToProps = (state : any) => ({});
export default connect<{}, DispatchProps, DataProps>(mapStateToProps, mapDispatchToProps)(ItemContent);