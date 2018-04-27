import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as Doc from '../store/data/document';
import { ItemTree, ItemID, Item as ItemData } from '../store/data/item';

import Item from './item';

import { DispatchProps, mapDispatchToProps, ApplicationState } from '../store';

type DataProps = {
	document : Doc.Document | undefined
}

type ComponentProps = DataProps & DispatchProps;

class Document extends React.Component<ComponentProps> {
	viewIndex : number = 0;

	constructor(props : ComponentProps) {
		super(props);
		props.actions.document.initializeDocument(undefined);
	}

	getDocumentTree(doc : Doc.Document, nodeID : ItemID) : ItemTree {
		const rootItem = doc.items[nodeID];
		const nodeIndex = this.viewIndex;

		this.viewIndex++;
		const nodeChildren = rootItem.children.map(child => this.getDocumentTree(doc, child));
	
		return {
			item: rootItem,
			viewIndex: nodeIndex,
			focused: nodeIndex == doc.focusIndex,
			children: nodeChildren
		};
	}

	render() {
		const doc = this.props.document;

		if (!doc)
			return <h1>NODOC</h1>;

		this.viewIndex = 0;
		const tree = this.getDocumentTree(doc, doc.rootItemID);

		document.title = doc.title + " | Seriatim";

		return (
			<main>
				<div id="document">
					<Item node={tree} key={tree.item.itemID} />
				</div>
			</main>
		);
	}
}

const mapStateToProps = (state : ApplicationState) => ({ document: state.document });

export default connect(mapStateToProps, mapDispatchToProps)(Document);