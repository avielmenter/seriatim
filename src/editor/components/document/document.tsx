import * as React from 'react';
import { connect } from 'react-redux';
import { List } from 'immutable';

import { Error } from '../../store/data/error';
import { Document as DocumentData, getLastItem } from '../../store/data/document';

import DocumentView from './documentView';
import DocumentHeader from './documentHeader';

import { DispatchProps, mapDispatchToProps, ApplicationState } from '../../store';

import * as Server from '../../network/server';
import { Permissions } from '../../../server';

type StateProps = {
	errors: List<Error>,
	document: DocumentData | null
	permissions: Permissions | null
}

type AttrProps = {

}

type ComponentProps = StateProps & AttrProps & DispatchProps;

class Document extends React.Component<ComponentProps> {
	saveInterval?: number;
	cmdPressed: boolean = false;

	constructor(props: ComponentProps) {
		super(props);
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

		if (!item)	// can't do anything with an empty document
			return;

		if (!event.ctrlKey && !event.metaKey) {
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
				case 'b':
					if (doc.selection && event.shiftKey)
						this.props.actions.item.blockQuoteSelection();
					else if (doc.selection)
						this.props.actions.item.emboldenSelection();
					else if (focusedItem && event.shiftKey)
						this.props.actions.item.blockQuote(focusedItem);
					else if (focusedItem)
						this.props.actions.item.emboldenItem(focusedItem);
					else
						preventDefault = false;
					break;

				case 'i':
					if (focusedItem && event.shiftKey)
						this.props.actions.item.addImage(focusedItem)
					else if (doc.selection)
						this.props.actions.item.italicizeSelection();
					else if (focusedItem)
						this.props.actions.item.italicizeItem(focusedItem);
					else
						preventDefault = false;
					break;

				case 'k':
					if (focusedItem)
						this.props.actions.item.addURL(focusedItem);
					else
						preventDefault = false;
					break;

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
						actions.paste(item);

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
					if (event.shiftKey || (lastItem && lastItem.itemID == doc.rootItemID)) {
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

	handleMainClick(event: React.MouseEvent<HTMLElement, MouseEvent>) {
		const actions = this.props.actions.document;
		const doc = this.props.document;

		if (doc != undefined && doc.focusedItemID != undefined)
			actions.setFocus(undefined);
		else
			actions.multiSelect(undefined);
	}

	componentDidMount() {
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

					window.onbeforeunload = (event: BeforeUnloadEvent) => {
						const msg = this.props.document && this.props.document.editedSinceSave
							? "Are you sure you want to leave this page? You have unsaved changes which will be lost."
							: undefined;

						if (msg)
							event.returnValue = msg;
						return msg;
					}
				}
			})
			.catch(_response => {
				errors.addError({
					status: "error",
					code: "OTHER_ERROR",
					error: "There was an error contacting the server."
				});
			});
	}

	render() {
		const doc = this.props.document;

		document.title = !doc ? "..." : doc.title + " | Seriatim";

		return (
			<main onClick={(event) => this.handleMainClick(event)}>
				<DocumentHeader />
				<div id="documentScrollContainer">
					<DocumentView document={doc} />
				</div>
			</main>
		);
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