import * as React from 'react';
import { connect } from 'react-redux';

import { Document } from '../store/data/document';
import { Item } from '../store/data/item';

import { DispatchProps, mapDispatchToProps, ApplicationState } from '../store';

import MenuItem from './menuItem';

type StateProps = {
	document : Document | undefined
}

type AttrProps = {

}

type ComponentProps = StateProps & AttrProps & DispatchProps;

function getLastItem(document : Document, curr : Item) : Item {
	if (curr.children.length == 0)
		return curr;

	const lastChild = document.items[curr.children[curr.children.length]];
	if (!lastChild)
		return curr;
	return getLastItem(document, lastChild); 
}

const DocumentHeader : React.SFC<ComponentProps> = (props) => {
	const document = props.document;
	if (!document)
		return (<div />);

	const actions = props.actions.document;
	const focused = !document.focusedItemID ? undefined : document.items[document.focusedItemID];
	const lastItem = getLastItem(document, document.items[document.rootItemID]);
	
	return (
		<div id="documentHeader">
			<div id="headerContents">
				<h1>{document.title}</h1>
				<div id="documentMenu">
					<div className="menuItem">
						File
						<ul>
							<MenuItem enabled={false} text="Save" shortcut="Ctrl-S" callback={() => {}} />
							<MenuItem enabled={false} text="Exit" callback={() => {}} />
						</ul>
					</div>
					<div className="menuItem">
						Edit
						<ul>
							<MenuItem text="Add Item" icon="+" shortcut="Ctrl-⏎" 
								callback={() => actions.addItemAfterSibling(focused || lastItem, true)} />
							<MenuItem text="Add Item To Sibling" icon="▼" shortcut="Ctrl-⇧-⏎"
								callback={() => actions.addItemToParent(focused || lastItem)} />
							<MenuItem text="Remove Item" icon="X" shortcut="Ctrl-⌫"
								callback={() => actions.removeItem(focused || lastItem)} />
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