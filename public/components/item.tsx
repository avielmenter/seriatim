import * as React from 'react';
import { connect } from 'react-redux';

import { ApplicationState, DispatchProps, mapDispatchToProps, handleClick } from '../store';
import { ItemTree, ItemID, ItemType, Item as ItemData } from '../store/data/item';

import ItemContent from './itemContent';

type AttrProps = {
	node : ItemTree
}

type StateProps = {

}

type ComponentProps = StateProps & AttrProps & DispatchProps;

const Item : React.SFC<ComponentProps> = (props) => {
	const { item, children } = props.node;
	const { text } = item;
	const { itemType } = item.view;

	const actions = props.actions.document;

	return (
		<div className={itemType == "Title" ? "Header" : itemType} id={item.itemID}>
			<div className="collapseExpand">
				{props.node.item.view.focused && <div className="showFocused">
					&ndash;
				</div>}
				{item.children.length > 0 && <button className={item.view.collapsed ? "expandButton" : "collapseButton"}
						onClick={(event) => handleClick(event, () => actions.toggleItemCollapse(item))}>
					{item.view.collapsed ? "▶" : "▼"}
				</button>}
			</div>
			<ItemContent node={props.node} />
			{!item.view.collapsed && children.map(child =>
				<Item {...props} node={child} key={child.item.itemID} />
			)}
		</div>
	);
};

const mapStateToProps = (state : any) => ({ })

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(Item);