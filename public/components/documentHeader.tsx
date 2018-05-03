import * as React from 'react';
import { connect } from 'react-redux';

import { Document, getLastItem } from '../store/data/document';
import { Item } from '../store/data/item';

import { DispatchProps, mapDispatchToProps, ApplicationState, handleClick } from '../store';

import MenuItem from './menuItem';

type StateProps = {
	document : Document | undefined
}

type AttrProps = {

}

type ComponentProps = StateProps & AttrProps & DispatchProps;

const DocumentHeader : React.SFC<ComponentProps> = (props) => {
	const document = props.document;
	if (!document)
		return (<div />);

	const actions = props.actions.document;
	const focused = !document.focusedItemID ? undefined : document.items[document.focusedItemID];
	const lastItem = getLastItem(document, document.items[document.rootItemID]);

	const addSibling = (focused || lastItem).view.itemType == "Title" ? 
							() => actions.addItemToParent(focused || lastItem) :
							() => actions.addItemAfterSibling(focused || lastItem, false);
	
	return (
		<div id="documentHeader">
			<div id="headerContents">
				<h1>{document.title}</h1>
				<div id="documentMenu">
					<div className="menuItem">
						File
						<ul>
							<MenuItem enabled={false} text="Save" shortcut="Ctrl-S" callback={() => {}} />
							<MenuItem text="Rename..." shortcut="Esc + ↹" 
								callback={(event) => handleClick(event, () => actions.setFocus(document.items[document.rootItemID]))} />
							<MenuItem enabled={false} text="Exit" callback={() => {}} />
						</ul>
					</div>
					<div className="menuItem">
						Edit
						<ul>
							<MenuItem text="Add Item" icon="+" shortcut="Ctrl-⏎" ID="addSibling"
								callback={(event) => handleClick(event, addSibling)} />
							<MenuItem text="Add Sub-Item" icon="▼" shortcut="Ctrl-⇧-⏎" ID="addChild"
								callback={(event) => handleClick(event, () => actions.addItemToParent(focused || lastItem))} />
							<MenuItem text="Indent" icon="»" shortcut="Ctrl-]" enabled={focused != undefined} ID="indentItem"
								callback={(event) => handleClick(event, () => actions.indentItem(focused || lastItem))} />
							<MenuItem text="Indent" icon="«" shortcut="Ctrl-[" enabled={focused != undefined} ID="unindentItem"
								callback={(event) => handleClick(event, () => actions.unindentItem(focused || lastItem))} />
							<MenuItem text="Remove Item" icon="X" shortcut="Ctrl-⌫" ID="removeItem" enabled={lastItem.view.itemType != "Title"}
								callback={(event) => handleClick(event, () => actions.removeItem(focused || lastItem))} />
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

const mapStateToProps = (state : ApplicationState | { }) => ({
	document: state == {} ? undefined : (state as ApplicationState).document.present
});

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(DocumentHeader);