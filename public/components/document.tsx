import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { default as DocumentData, getLastItem } from '../store/data/document';
import { ItemTree, ItemID, Item as ItemData } from '../store/data/item';

import Item from './item';
import DocumentHeader from './documentHeader';

import { DispatchProps, mapDispatchToProps, ApplicationState } from '../store';

type StateProps = {
	document : DocumentData | undefined
}

type AttrProps = {

}

type ComponentProps = StateProps & AttrProps & DispatchProps;

class Document extends React.Component<ComponentProps> {
	viewIndex : number = 0;
	documentDiv : React.RefObject<HTMLDivElement>;

	prevSelected : boolean = false;

	constructor(props : ComponentProps) {
		super(props);
		props.actions.document.initializeDocument(undefined);

		this.documentDiv = React.createRef<HTMLDivElement>();
	}

	getDocumentTree(doc : DocumentData, nodeID : ItemID) : ItemTree {
		const rootItem = doc.items[nodeID];

		const isSelectionStart = doc.selection && nodeID == doc.selection.start;
		const isSelectionEnd = doc.selection && nodeID == doc.selection.end;

		const thisSelected = (doc.selection && (
								this.prevSelected || 
								(!this.prevSelected && (isSelectionEnd || isSelectionStart))
							)) as boolean;

		let nextSelected = thisSelected;
		if (this.prevSelected && (thisSelected && (isSelectionStart || isSelectionEnd)) || (isSelectionEnd && isSelectionStart))
			nextSelected = false;
		this.prevSelected = nextSelected;

		const nodeChildren = rootItem.children.map(child => this.getDocumentTree(doc, child));
	
		return {
			item: rootItem,
			focused: doc.focusedItemID == nodeID,
			selected: thisSelected,
			children: nodeChildren
		};
	}

	handleKeyDown = (event: KeyboardEvent) : void => {
		const actions = this.props.actions.document;
		let preventDefault = true;

		const doc = this.props.document;
		if (!doc)
			return;

		const focusedItem = doc.focusedItemID ?doc.items[doc.focusedItemID] : undefined;
		const lastItem = getLastItem(doc, doc.items[doc.rootItemID]);

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
					if (doc.focusedItemID != undefined)
						actions.setFocus(undefined);
					else
						actions.multiSelect(undefined);
					break

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
				case 'z':
					if (event.shiftKey)
						actions.redo();
					else
						actions.undo();
					break;

				case 'y':
					actions.redo();
					break;

				case 'h':
					if (event.shiftKey)
						actions.makeHeader(item);
					else
						preventDefault = false;
					break;

				case 'i':
					if (event.shiftKey)
						actions.makeItem(item);
					else
						preventDefault = false;
					break;

				case '[':
					if (focusedItem != undefined)
						actions.unindentItem(focusedItem);
				break;

				case ']':
					if (focusedItem != undefined)
						actions.indentItem(item);
				break;

				case ' ':
					if (item.children.length > 0 || item.view.collapsed)
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

	handleMainClick(event : React.MouseEvent<HTMLMainElement>) {
		const actions = this.props.actions.document;
		const doc = this.props.document;

		if (doc != undefined && doc.focusedItemID != undefined)
			actions.setFocus(undefined);
		else
			actions.multiSelect(undefined);
	}

	componentWillMount() {
		document.addEventListener('keydown', this.handleKeyDown);
	}

	render() {
		const doc = this.props.document;

		if (!doc)
			return <h1>NODOC</h1>;

		this.prevSelected = false;
		const tree = this.getDocumentTree(doc, doc.rootItemID);

		document.title = doc.title + " | Seriatim";

		return (
			<main onClick={(event) => this.handleMainClick(event) }>
				<DocumentHeader />
				<div id="documentScrollContainer">
					<div id="document" tabIndex={0} ref={this.documentDiv}>
						<Item node={tree} key={tree.item.itemID} />
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

const mapStateToProps = (state : ApplicationState | { }) => ({ 
	document: state == {} ? undefined : (state as ApplicationState).document.present 
});

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(Document);