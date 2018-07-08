import * as React from 'react';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';

import { Document as DocumentData, getLastItem, ItemDictionary, getSelectedItems } from '../store/data/document';
import { Item as ItemData, ItemTree, ItemID } from '../store/data/item';

import Item from './item';
import DocumentHeader from './documentHeader';
import LoadingSpinner from './loadingSpinner';

import { DispatchProps, mapDispatchToProps, ApplicationState } from '../store';

import * as Server from '../network/server';

type StateProps = {
	document: DocumentData | undefined
}

type AttrProps = {

}

type ComponentProps = StateProps & AttrProps & DispatchProps;

class Document extends React.Component<ComponentProps> {
	documentDiv: React.RefObject<HTMLDivElement>;

	constructor(props: ComponentProps) {
		super(props);
		this.documentDiv = React.createRef<HTMLDivElement>();
	}

	getDocumentTree(doc: DocumentData, selectedItems: ItemDictionary, nodeID: ItemID): ItemTree {
		const rootItem = doc.items.get(nodeID);

		const nodeChildren = rootItem.children.map(child => this.getDocumentTree(doc, selectedItems, child));

		return {
			item: rootItem,
			focused: doc.focusedItemID == nodeID,
			selected: selectedItems.has(nodeID),
			children: nodeChildren.toList()
		};
	}

	getTextAreaSelection(): string | undefined {
		const activeEl = document.activeElement;
		if (!activeEl || activeEl.tagName.toLowerCase() != 'textarea')
			return undefined;

		const activeTextArea = activeEl as HTMLTextAreaElement;
		if (activeTextArea.selectionStart == activeTextArea.selectionEnd)
			return undefined;

		const selectedText = activeTextArea.textContent == null ?
			undefined :
			activeTextArea.textContent.slice(activeTextArea.selectionStart, activeTextArea.selectionEnd);

		return selectedText;
	}

	handleKeyDown = (event: KeyboardEvent): void => {
		const actions = this.props.actions.document;
		let preventDefault = true;

		const doc = this.props.document;
		if (!doc)
			return;

		const focusedItem = doc.focusedItemID ? doc.items.get(doc.focusedItemID) : undefined;
		const lastItem = getLastItem(doc, doc.items.get(doc.rootItemID));

		const item = focusedItem || lastItem;

		if (!event.ctrlKey) {
			switch (event.key.toLowerCase()) {
				case 'tab':
					if (event.shiftKey)
						actions.decrementFocus();
					else
						actions.incrementFocus(true);
					break;

				case 'esc':
				case 'escape':
					if (doc.selection)
						actions.multiSelect(undefined);
					else
						actions.setFocus(undefined);
					break;
				case 'enter':
					if (event.shiftKey)
						actions.multiSelect(focusedItem);
					else
						preventDefault = false;
					break;

				default:
					preventDefault = false;
					break;
			}
		} else {
			switch (event.key.toLowerCase()) {
				case 's':
					const document_id = window.location.search.substring(1); // skip initial ? symbol
					Server.saveDocument(document_id, doc)
						.then(response => {
							if (response.status == 'success')
								actions.updateItemIDs(response.data);
						});
					break;

				case 'z':
					if (event.shiftKey)
						actions.redo();
					else
						actions.undo();
					break;

				case 'y':
					actions.redo();
					break;

				case 'c':
					if (this.getTextAreaSelection()) {
						actions.copyItem(undefined);
						preventDefault = false;
					} else {
						if (doc.selection)
							actions.copySelection();
						else if (focusedItem != undefined)
							actions.copyItem(focusedItem);
					}
					break;

				case 'x':
					if (doc.selection) {
						actions.copySelection();
						actions.removeSelection();
					} else if (focusedItem) {
						actions.copyItem(focusedItem);
						actions.removeItem(focusedItem);
					}
					break;

				case 'v':
					if (focusedItem && !doc.clipboard)
						preventDefault = false;
					else
						actions.paste(focusedItem || lastItem);

					break;

				case 'h':
					if (event.shiftKey && !doc.selection)
						actions.makeHeader(item);
					else if (event.shiftKey && doc.selection)
						actions.makeSelectionHeader();
					else
						preventDefault = false;
					break;

				case 'i':
					if (event.shiftKey && !doc.selection)
						actions.makeItem(item);
					else if (event.shiftKey && doc.selection)
						actions.makeSelectionItem();
					else
						preventDefault = false;
					break;

				case '[':
					if (doc.selection)
						actions.unindentSelection();
					else if (focusedItem != undefined)
						actions.unindentItem(focusedItem);
					break;

				case ']':
					if (doc.selection)
						actions.indentSelection();
					else if (focusedItem != undefined)
						actions.indentItem(item);
					break;

				case ' ':
					if (item.children.count() > 0 || item.view.collapsed)
						actions.toggleItemCollapse(item);
					break;

				case 'return':
				case 'enter':
					if (event.shiftKey || lastItem.itemID == doc.rootItemID) {
						actions.addItemToParent(item);
						if (focusedItem != undefined)
							actions.incrementFocus(false);
					} else {
						actions.addItemAfterSibling(item, focusedItem != undefined);
					}
					break;

				case 'del':
				case 'delete':
					if (doc.selection)
						actions.removeSelection();
					else
						actions.removeItem(item);
					break;

				default:
					if (event.keyCode == 219 && focusedItem != undefined)		// use keycodes for edge compatibility
						actions.unindentItem(focusedItem);						// I thought I didn't have to write separate websites for IE anymore
					else if (event.keyCode == 221 && focusedItem != undefined)
						actions.indentItem(focusedItem)
					else
						preventDefault = false;
					break;
			}
		}

		if (preventDefault)
			event.preventDefault();
	}

	handleMainClick(event: React.MouseEvent<HTMLMainElement>) {
		const actions = this.props.actions.document;
		const doc = this.props.document;

		if (doc != undefined && doc.focusedItemID != undefined)
			actions.setFocus(undefined);
		else
			actions.multiSelect(undefined);
	}

	componentWillMount() {
		const actions = this.props.actions.document;

		document.addEventListener('keydown', this.handleKeyDown);

		const document_id = window.location.search.substring(1); // skip initial ? symbol
		Server.fetchDocument(document_id)
			.then(response => {
				if (response.status == "success")
					actions.loadDocument(response.data)
			});
	}

	render() {
		const doc = this.props.document;

		const tree = !doc ? undefined : this.getDocumentTree(doc, getSelectedItems(doc), doc.rootItemID);

		document.title = !doc ? "..." : doc.title + " | Seriatim";

		return (
			<main onClick={(event) => this.handleMainClick(event)}>
				<DocumentHeader />
				<div id="documentScrollContainer">
					<div id="document" tabIndex={0} ref={this.documentDiv}>
						{doc ? <Item node={tree as ItemTree} key={(tree as ItemTree).item.itemID} /> : <LoadingSpinner />}
					</div>
				</div>
			</main>
		);
	}

	componentDidMount() {
		if (this.documentDiv.current)
			this.documentDiv.current.focus();
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.handleKeyDown);
	}
}

const mapStateToProps = (state: ApplicationState | {}) => ({
	document: state == {} ? undefined : (state as ApplicationState).document.present
});

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(Document);