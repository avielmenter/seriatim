import * as React from 'react';
import { connect } from 'react-redux';

import { Document, getLastItem, getEmptyDocument } from '../store/data/document';
import { Item } from '../store/data/item';

import { DispatchProps, mapDispatchToProps, ApplicationState, handleClick } from '../store';

import MenuItem from './menuItem';

import * as Server from '../network/server';
import SavingSpinner from './savingSpinner';

type StateProps = {
	state: ApplicationState | undefined
}

type AttrProps = {

}

type ComponentProps = StateProps & AttrProps & DispatchProps;

const DocumentHeader: React.SFC<ComponentProps> = (props) => {
	if (!props || !props.state)
		return (<div />);

	const state = props.state;
	const canEdit = state.permissions && state.permissions.edit;

	const isLoading = !state.document.present;
	const document = state.document.present || getEmptyDocument();

	const actions = props.actions.document;
	const focused = !document || !document.focusedItemID ? undefined : document.items.get(document.focusedItemID);
	const lastItem = getLastItem(document, document.items.get(document.rootItemID));

	const addSibling = (focused || lastItem).view.itemType == "Title" ?
		() => actions.addItemToParent(focused || lastItem) :
		() => actions.addItemAfterSibling(focused || lastItem, false);

	const collapsable = focused != undefined && focused.children.count() > 0;
	const expandable = focused != undefined && collapsable && focused.view.collapsed;

	const document_id = window.location.search.substring(1); // skip initial ? symbol

	const makeCopy = () => {
		Server.makeCopy(document_id)
			.then(response => {
				if (response.status == 'success')
					window.location.href = SERIATIM_CLIENT_URL + 'editor/?' + response.data.documentID;
				else
					props.actions.errors.addError(response);
			});
	};

	return (
		<div id="documentHeader">
			<div id="headerContents">
				<h1 className={isLoading || document.title.length == 0 ? "empty" : ""}
					onClick={(event) => handleClick(event, () => canEdit && actions.setFocus(document.items.get(document.rootItemID)))}>
					{isLoading ? "Loading..." : document.title.length == 0 ? "Untitled Document..." : document.title}
					<SavingSpinner visible={state.saving} />
					{!canEdit && !isLoading && <span id="readOnlyMessage">
						You are viewing this document in read only mode. To edit it, <span id="copyDocument" onClick={makeCopy}>copy it</span> onto your account.
					</span>}
				</h1>
				<div id="documentMenu">
					<div className="menuItem">
						File
						<ul>
							<MenuItem text="Save" shortcut="Ctrl-S" callback={() => {
								if (!state.document || !state.document.present)
									return;

								Server.saveDocument(document_id, state.document.present)
									.then(response => {
										if (response.status == 'success')
											actions.updateItemIDs(response.data);
										else
											props.actions.errors.addError(response);
									})
									.finally(() => props.actions.stopSaving());

								props.actions.startSaving();
							}} />
							<MenuItem text="Make Copy" enabled={!isLoading} enabledOnReadOnly={true} callback={makeCopy} />
							<MenuItem text="Rename" shortcut="Esc, ↹"
								callback={(event) => handleClick(event, () => actions.setFocus(document.items.get(document.rootItemID)))} />
							<MenuItem text="Exit" enabledOnReadOnly={true} callback={() => { window.close() }} />
						</ul>
					</div>
					<div className="menuItem">
						Edit
						<ul>
							<MenuItem text="Add Item" icon="+" shortcut="Ctrl-⏎" ID="addSibling"
								callback={(event) => handleClick(event, addSibling)} />
							<MenuItem text="Add Sub-Item" icon="▼" shortcut="Ctrl-⇧-⏎" ID="addChild"
								callback={(event) => handleClick(event, () => actions.addItemToParent(focused || lastItem))} />
							<MenuItem text="Indent" icon="»" shortcut="Ctrl-]" enabled={focused != undefined || document.selection != undefined} ID="indentItem"
								callback={(event) => handleClick(event, () => document.selection ? actions.indentSelection() : actions.indentItem(focused || lastItem))} />
							<MenuItem text="Unindent" icon="«" shortcut="Ctrl-[" enabled={focused != undefined || document.selection != undefined} ID="unindentItem"
								callback={(event) => handleClick(event, () => document.selection ? actions.unindentSelection() : actions.unindentItem(focused || lastItem))} />
							<MenuItem text="Copy" icon="⎘" shortcut="Ctrl-C" enabled={focused != undefined || document.selection != undefined} ID="copy"
								callback={(event) => handleClick(event, () => document.selection ? actions.copySelection() : actions.copyItem(focused || lastItem))} />
							<MenuItem text="Cut" icon="✂" shortcut="Ctrl-X" enabled={(focused != undefined && focused.view.itemType != "Title") || document.selection != undefined}
								ID="cut"
								callback={(event) => handleClick(event, () => {
									if (document.selection) {
										actions.copySelection();
										actions.removeSelection();
									} else if (focused) {
										actions.copyItem(focused);
										actions.removeItem(focused);
									}
								})} />
							<MenuItem text="Paste" icon="⎗" shortcut="Ctrl-V" ID="paste" enabled={document.clipboard != undefined}
								callback={(event) => handleClick(event, () => actions.paste(focused || lastItem))} />
							<MenuItem text="Undo" icon="⟲" shortcut="Ctrl-Z" ID="undo" enabled={state.document.past.length > 0}
								callback={(event) => handleClick(event, () => actions.undo())} />
							<MenuItem text="Redo" icon="⟳" shortcut="Ctrl-⇧-Z" ID="redo" enabled={state.document.future.length > 0}
								callback={(event) => handleClick(event, () => actions.redo())} />
							<MenuItem text="Remove" icon="X" shortcut="Ctrl-⌫" ID="removeItem"
								enabled={!(focused && focused.view.itemType == "Title") && lastItem.view.itemType != "Title"}
								callback={(event) => handleClick(event, () => document.selection ? actions.removeSelection() : actions.removeItem(focused || lastItem))} />
						</ul>
					</div>
					<div className="menuItem">
						View
						<ul>
							<MenuItem text={expandable ? "Expand Item" : "Collapse Item"} icon={expandable ? "▼" : "▶"} shortcut="Ctrl-␣" ID="collapse"
								enabled={collapsable} callback={(event) => handleClick(event, () => actions.toggleItemCollapse(focused as Item))} />
							<MenuItem text="Turn Into Header" shortcut="Ctrl-⇧-H" ID="makeHeader" enabled={(focused || lastItem).view.itemType != "Title"}
								callback={(event) => handleClick(event, () => document.selection ? actions.makeSelectionHeader() : actions.makeHeader(focused || lastItem))} />
							<MenuItem text="Turn Into Item" shortcut="Ctrl-⇧-I" ID="makeItem" enabled={(focused || lastItem).view.itemType != "Title"}
								callback={(event) => handleClick(event, () => document.selection ? actions.makeSelectionItem() : actions.makeItem(focused || lastItem))} />
						</ul>
					</div>
					<div className="menuItem">
						Selection
						<ul>
							<MenuItem text="Focus on Next Item" icon="→" shortcut="↹" ID="selectNext"
								callback={(event) => handleClick(event, () => actions.incrementFocus(false))} />
							<MenuItem text="Focus Previous Item" icon="←" shortcut="⇧-↹" ID="selectPrev"
								callback={(event) => handleClick(event, () => actions.decrementFocus())} />
							<MenuItem text="Select Item Range" icon="☰" shortcut="⇧-⏎" ID="multiSelect" enabled={focused != undefined}
								callback={(event) => handleClick(event, () => actions.multiSelect(focused))} />
							<MenuItem text="Unselect All" shortcut="Esc" ID="unselect" enabled={focused != undefined || document.selection != undefined}
								callback={(event) => handleClick(event, () => { actions.setFocus(undefined); actions.multiSelect(undefined); })} />
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

const mapStateToProps = (state: ApplicationState | {}) => ({
	state: state == {} ? undefined : (state as ApplicationState)
});

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(DocumentHeader);