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

	const collapsable = focused != undefined && focused.children.length > 0;
	const expandable = focused != undefined && collapsable && focused.view.collapsed;
	
	return (
		<div id="documentHeader">
			<div id="headerContents">
				<h1>{document.title}</h1>
				<div id="documentMenu">
					<div className="menuItem">
						File
						<ul>
							<MenuItem enabled={false} text="Save" shortcut="Ctrl-S" callback={() => {}} />
							<MenuItem text="Rename" shortcut="Esc, ↹" 
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
							<MenuItem text="Unindent" icon="«" shortcut="Ctrl-[" enabled={focused != undefined} ID="unindentItem"
								callback={(event) => handleClick(event, () => actions.unindentItem(focused || lastItem))} />
							<MenuItem text="Remove Item" icon="X" shortcut="Ctrl-⌫" ID="removeItem"
								enabled={!(focused && focused.view.itemType == "Title") && lastItem.view.itemType != "Title"}
								callback={(event) => handleClick(event, () => actions.removeItem(focused || lastItem))} />
						</ul>
					</div>
					<div className="menuItem">
						View
						<ul>
							<MenuItem text={expandable ? "Expand Item" : "Collapse Item"} icon={expandable ? "▼" : "▶"} shortcut="Ctrl-␣" ID="collapse"
								enabled={collapsable} callback={(event) => handleClick(event, () => actions.toggleItemCollapse(focused as Item))} />
							<MenuItem text="Turn Into Header" shortcut="Ctrl-⇧-H" ID="makeHeader" enabled={(focused || lastItem).view.itemType != "Title"}
								callback={(event) => handleClick(event, () => actions.makeHeader(focused || lastItem))} />
							<MenuItem text="Turn Into Item" shortcut="Ctrl-⇧-I" ID="makeItem" enabled={(focused || lastItem).view.itemType != "Title"}
								callback={(event) => handleClick(event, () => actions.makeItem(focused || lastItem))} />
						</ul>
					</div>
					<div className="menuItem">
						Selection
						<ul>
							<MenuItem text="Focus on Next Item" icon="→" shortcut="↹" ID="selectNext"
								callback={(event) => handleClick(event, () => actions.incrementFocus(false))} />
							<MenuItem text="Focus Previous Item" icon="←" shortcut="⇧-↹" ID="selectPrev"
								callback={(event) => handleClick(event, () => actions.decrementFocus())} />
							<MenuItem text="Select Item Range" shortcut="⇧-⏎" ID="multiSelect" enabled={focused != undefined}
								callback={(event) => handleClick(event, () => actions.multiSelect(focused))} />
							<MenuItem text="Unselect All" shortcut="Esc" ID="unselect" enabled={focused != undefined || document.selection != undefined}
								callback={(event) => handleClick(event, () => { actions.setFocus(undefined); actions.multiSelect(undefined); } )} />
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