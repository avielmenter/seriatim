import * as React from 'react';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';

import { Error } from '../store/data/error';
import { Document as DocumentData, getLastItem, ItemDictionary, getSelectedItems } from '../store/data/document';
import { Item as ItemData, ListItem, ItemID } from '../store/data/item';

import Item from './item';
import DocumentHeader from './documentHeader';
import LoadingSpinner from './loadingSpinner';
import ErrorMessage from './errorMessage';

import { DispatchProps, mapDispatchToProps, ApplicationState } from '../store';

import * as Server from '../network/server';
import { Permissions } from '../store/data/permissions';

type StateProps = {
	errors: List<Error>,
	document: DocumentData | null
	permissions: Permissions | null
}

type AttrProps = {

}

type ComponentProps = StateProps & AttrProps & DispatchProps;

class Document extends React.Component<ComponentProps> {
	documentDiv: React.RefObject<HTMLDivElement>;
	saveInterval?: number;

	constructor(props: ComponentProps) {
		super(props);
		this.documentDiv = React.createRef<HTMLDivElement>();
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

	saveDocument() {
		const document_id = window.location.search.substring(1); // skip initial ? symbol
		const doc = this.props.document;
		if (!doc)
			return;

		Server.saveDocument(document_id, doc)
			.then(response => {
				if (response.status == 'success')
					this.props.actions.document.updateItemIDs(response.data);
				else
					this.props.actions.errors.addError(response);
			})
			.finally(() => this.props.actions.stopSaving());

		this.props.actions.startSaving();
	}

	handleKeyDown = (event: KeyboardEvent): void => {
		const actions = this.props.actions.document;
		let preventDefault = true;

		const doc = this.props.document;
		if (!doc || !this.props.permissions || !this.props.permissions.edit)
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
					this.saveDocument();
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
		const errors = this.props.actions.errors;

		document.addEventListener('keydown', this.handleKeyDown);

		const document_id = window.location.search.substring(1); // skip initial ? symbol

		Server.fetchDocument(document_id)
			.then(response => {
				if (response.status == "error") {
					errors.addError(response);
					return;
				}

				this.props.actions.loadDocument(response);

				if (response.permissions && response.permissions.edit) {
					this.saveInterval = window.setInterval(() => {
						if (this.props.document && this.props.document.editedSinceSave)
							this.saveDocument();
					}, 5 * 60 * 1000);

					window.onbeforeunload = (event) => {
						const msg = this.props.document && this.props.document.editedSinceSave
							? "Are you sure you want to leave this page? You have unsaved changes which will be lost."
							: undefined;

						if (msg)
							event.returnValue = msg;
						return msg;
					}
				}
			})
			.catch(response => {
				errors.addError({
					status: "error",
					code: "OTHER_ERROR",
					error: "There was an error contacting the server."
				});
			});
	}

	getDocumentList(doc: DocumentData, selectedItems: ItemDictionary, curr: ItemID, indent: number = 0): List<ListItem> {
		const currItem: ListItem = {
			item: doc.items.get(curr),
			focused: doc.focusedItemID == curr,
			selected: selectedItems.has(curr),
			indent
		};

		const currItemList = List<ListItem>([currItem]);

		return currItem.item.view.collapsed
			? currItemList
			: currItem.item.children.reduce(
				(prev, childID) => prev.concat(this.getDocumentList(doc, selectedItems, childID, indent + 1)).toList(),
				currItemList
			);
	}

	render() {
		const doc = this.props.document;

		const list = !doc ? undefined : this.getDocumentList(doc, getSelectedItems(doc), doc.rootItemID);

		document.title = !doc ? "..." : doc.title + " | Seriatim";

		return (
			<main onClick={(event) => this.handleMainClick(event)}>
				<DocumentHeader />
				{this.props.errors.map((error, index) => <ErrorMessage error={error} index={index} key={index} />)}
				<div id="documentScrollContainer">
					<div id="document" tabIndex={0} ref={this.documentDiv}>
						{list ? list.map(i => <Item node={i} key={i.item.itemID} />) : <div id="loadingDocument"><LoadingSpinner /></div>}
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
		if (this.saveInterval)
			clearInterval(this.saveInterval);
	}
}

const mapStateToProps = (state: ApplicationState | {}) => ({
	errors: state == {} ? List<Error>() : (state as ApplicationState).errors,
	document: state == {} || !(state as ApplicationState).document.present ? null : (state as ApplicationState).document.present,
	permissions: state == {} ? null : (state as ApplicationState).permissions
})

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(Document);