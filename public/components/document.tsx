import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Document as DocumentData, getLastItem } from '../store/data/document';
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

	constructor(props : ComponentProps) {
		super(props);
		props.actions.document.initializeDocument(undefined);

		this.documentDiv = React.createRef<HTMLDivElement>();
	}

	getDocumentTree(doc : DocumentData, nodeID : ItemID) : ItemTree {
		const rootItem = doc.items[nodeID];
		const nodeChildren = rootItem.children.map(child => this.getDocumentTree(doc, child));
	
		return {
			item: rootItem,
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
				case 'back':
				case 'backspace':
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

	componentWillMount() {
		document.addEventListener('keydown', this.handleKeyDown);
	}

	render() {
		const doc = this.props.document;

		if (!doc)
			return <h1>NODOC</h1>;

		const tree = this.getDocumentTree(doc, doc.rootItemID);

		document.title = doc.title + " | Seriatim";

		return (
			<main onClick={(event) => { this.props.actions.document.setFocus(undefined); } }>
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