import * as React from 'react';
import { connect } from 'react-redux';

import { Range } from 'immutable';
import * as classNames from 'classnames';

import { ApplicationState, DispatchProps, mapDispatchToProps, handleClick } from '../../store';
import { ListItem, ItemID, ItemType, Item as ItemData } from '../../store/data/item';

import ItemContent from './itemContent';
import MaterialIcon from '../util/materialIcon';

type AttrProps = {
	node: ListItem
}

type StateProps = {

}

type ComponentProps = StateProps & AttrProps & DispatchProps;

const Item: React.SFC<ComponentProps> = (props) => {
	const node = props.node;
	const { item } = props.node;
	const { text } = item;
	const { itemType } = node;

	const actions = props.actions.document;

	const classes = classNames({
		'Header': itemType == 'Title' || itemType == 'Header',
		'Item': itemType == 'Item',
		'focusedItem': node.focused
	});

	return (
		<div className={classes} id={item.itemID}>
			{Range(0, node.indent).map(i => <div className="itemIndent" key={"itemIndent_" + item.itemID + "_" + i} />)}
			<div className="collapseExpand">
				{itemType != "Title" && item.children.count() > 0 && <button className={item.view.collapsed ? "expandButton" : "collapseButton"}
					onClick={handleClick(() => actions.toggleItemCollapse(item))}>
					<MaterialIcon icon={item.view.collapsed ? "arrow_right" : "arrow_drop_down"} />
				</button>}
			</div>
			<ItemContent node={props.node} />
		</div>
	);
};

const mapStateToProps = (state: any) => ({})

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(Item);