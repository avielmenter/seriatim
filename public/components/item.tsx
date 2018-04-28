import * as React from 'react';
import { connect } from 'react-redux';

import { ApplicationState, DispatchProps, mapDispatchToProps } from '../store';
import { ItemTree, ItemID, ItemType, Item as ItemData } from '../store/data/item';

import ItemContent from './itemContent';

type DataProps = {
	node : ItemTree
}

type ComponentProps = DataProps & DispatchProps;

const Item : React.SFC<ComponentProps> = (props) => {
	const { item, children } = props.node;
	const { text, itemType } = item;

	return (
		<div className={itemType == "Title" ? "Header" : itemType} id={item.itemID}>
			<div className="collapseExpand">
				{props.node.item.view.focused && <div className="showFocused">
					&ndash;
				</div>}
				{item.children.length > 0 && <button className={item.view.collapsed ? "expandButton" : "collapseButton"}
						onClick={() => props.actions.document.toggleItemCollapse(item)}>
					{item.view.collapsed ? "▶" : "▼"}
				</button>}
			</div>
			<div className="buttons">
				<div className="buttonMenu">
					{itemType != "Title" && 
						<button
							title="Add item after this one"
							className="addSibling"
							onClick={() => props.actions.document.addItemAfterSibling(item)}
						>
							+
						</button>
					}
					<button
						title = "Add child item"
						className="addChild"
						onClick={() => props.actions.document.addItemToParent(item)}
					>
						&#9660;
					</button>
					{itemType != "Title" && 
						<button
							title="Remove this item"
							className="removeItem"
							onClick={() => props.actions.document.removeItem(item)}
						>
							X
						</button>
					}
				</div>
			</div>
			<ItemContent node={props.node} />
			{!item.view.collapsed && children.map(child =>
				<Item {...props} node={child} key={child.item.itemID} />
			)}
		</div>
	);
};

const mapStateToProps = (state : any) => ({ })

export default connect<{}, DispatchProps, DataProps>(mapStateToProps, mapDispatchToProps)(Item);