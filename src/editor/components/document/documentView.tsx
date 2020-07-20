import * as React from 'react';
import { List } from 'immutable';

import { Document, getSelectedItems, getItemList } from '../../io/document';

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

	render() {
		const { document } = this.props;
		const list = !document ? undefined : getItemList(document, getSelectedItems(document), document.rootItemID);

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