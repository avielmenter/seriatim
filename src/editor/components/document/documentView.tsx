import * as React from 'react';
import { List } from 'immutable';

import { Document, getLastItem, ItemDictionary, getSelectedItems } from '../../store/data/document';
import { ListItem, ItemID } from '../../store/data/item';

import Item from '../item/item';
import LoadingSpinner from '../util/loadingSpinner'

type StateProps = {

}

type AttrProps = {
	document: Document | null
}

type ComponentProps = StateProps & AttrProps;

class DocumentView extends React.PureComponent<ComponentProps> {
	documentDiv: React.RefObject<HTMLDivElement>;

	constructor(props: ComponentProps) {
		super(props);
		this.documentDiv = React.createRef<HTMLDivElement>();
	}

	getDocumentList(doc: Document, selectedItems: ItemDictionary, curr: ItemID, indent: number = 0): List<ListItem> {
		const currItem: ListItem = {
			item: doc.items.get(curr),
			focused: doc.focusedItemID == curr,
			selected: selectedItems.has(curr),
			itemType: curr == doc.rootItemID
				? "Title"
				: (/^#+\s+/.test(doc.items.get(curr).text) ? "Header" : "Item"), // starts with at least one '#', and then at least one space
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
		const { document } = this.props;
		const list = !document ? undefined : this.getDocumentList(document, getSelectedItems(document), document.rootItemID);

		return (
			<div id="document" tabIndex={0} ref={this.documentDiv}>
				{list ?
					list.map(i => <Item node={i} key={i.item.itemID} />) :
					<div id="loadingDocument"><LoadingSpinner /></div>
				}
			</div>
		);
	}

	componentDidMount() {
		if (this.documentDiv.current)
			this.documentDiv.current.focus();
	}
}

export default DocumentView;