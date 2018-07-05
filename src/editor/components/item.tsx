import * as React from 'react';
import { connect } from 'react-redux';
import * as classNames from 'classnames';

import { ApplicationState, DispatchProps, mapDispatchToProps, handleClick } from '../store';
import { ItemTree, ItemID, ItemType, Item as ItemData } from '../store/data/item';

import ItemContent from './itemContent';

type AttrProps = {
	node: ItemTree
}

type StateProps = {

}

type ComponentProps = StateProps & AttrProps & DispatchProps;

const Item: React.SFC<ComponentProps> = (props) => {
	const node = props.node;
	const { item, children } = props.node;
	const { text } = item;
	const { itemType } = item.view;

	const actions = props.actions.document;

	const classes = classNames({
		'Header': itemType == 'Title' || itemType == 'Header',
		'Item': itemType == 'Item'
	});

	return (
		<div className={classes} id={item.itemID}>
			<div className="collapseExpand">
				{node.focused && <div className="showFocused">
					&ndash;
				</div>}
				{item.children.count() > 0 && <button className={item.view.collapsed ? "expandButton" : "collapseButton"}
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

const mapStateToProps = (state: any) => ({})

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(Item);