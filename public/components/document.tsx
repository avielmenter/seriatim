import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Document as DocumentData } from '../store/data/document';
import { ItemTree, ItemID, Item as ItemData } from '../store/data/item';

import Item from './item';

import { DispatchProps, mapDispatchToProps, ApplicationState } from '../store';

type DataProps = {
	document : DocumentData | undefined
}

type ComponentProps = DataProps & DispatchProps;

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

				default:
					preventDefault = false;
					break;
			}
		}

		if (preventDefault)
			event.preventDefault();
	}

	handleClick = (event: MouseEvent) : void => {
		this.props.actions.document.setFocus(undefined);
	}

	componentWillMount() {
		document.addEventListener('keydown', this.handleKeyDown);
		document.addEventListener('click', this.handleClick, { capture: true });
	}

	render() {
		const doc = this.props.document;

		if (!doc)
			return <h1>NODOC</h1>;

		const tree = this.getDocumentTree(doc, doc.rootItemID);

		document.title = doc.title + " | Seriatim";

		return (
			<main>
				<div id="document" tabIndex={0} ref={this.documentDiv}>
					<Item node={tree} key={tree.item.itemID} />
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
		document.removeEventListener('click', this.handleClick);
	}
}

const mapStateToProps = (state : ApplicationState | { }) => ({ 
	document: state == {} ? undefined : (state as ApplicationState).document.present 
});

export default connect<DataProps, DispatchProps, {}>(mapStateToProps, mapDispatchToProps)(Document);