import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactMarkdown from 'react-markdown';

import * as classNames from 'classnames';

import { DispatchProps, mapDispatchToProps, ApplicationState, handleClick } from '../../store';

import { ListItem, ItemID, getReactStyles } from '../../store/data/item';

import ItemEditor from './itemEditor';
import MaterialIcon from '../util/materialIcon';

type StateProps = {
	canEdit: boolean
}

type AttrProps = {
	node: ListItem
}

type ComponentProps = StateProps & AttrProps & DispatchProps;

function handleContentClick(event: React.MouseEvent<HTMLDivElement>, props: ComponentProps): void {
	if (!props.canEdit)
		return;

	event.stopPropagation();
	event.preventDefault();

	const actions = props.actions.document;
	const item = props.node.item;

	if (event.shiftKey)
		actions.multiSelect(item);
	else
		actions.setFocus(item);
}

function getContentDivId(itemID: ItemID) {
	return '__content__' + itemID;
}

const areComponentsEqual = (prevProps: ComponentProps, nextProps: ComponentProps) =>
	prevProps.node.item.text == nextProps.node.item.text &&
	prevProps.node.focused == nextProps.node.focused &&
	prevProps.node.indent == nextProps.node.indent &&
	prevProps.node.selected == nextProps.node.selected &&
	prevProps.node.item.styles == nextProps.node.item.styles;

const ItemContent: React.NamedExoticComponent<ComponentProps> = React.memo((props) => {
	const node = props.node;
	const item = props.node.item;
	const actions = props.actions;

	const textWithoutHeader = item.text.replace(/(^#+\s+)?/, '');

	const classes = classNames({
		"itemContent": true,
		"selectedItem": node.selected
	});

	const styles = getReactStyles(item);

	return (
		<div className={classes} id={getContentDivId(item.itemID)} onClick={(event) => handleContentClick(event, props)}>
			{node.isTableOfContents && props.canEdit &&
				<div id="tocRefresh"
					onClick={handleClick(() => actions.document.refreshTableOfContents())}>
					<MaterialIcon icon="refresh" iconColor="#0AF" />
				</div>
			}
			<div onClick={(event) => handleContentClick(event, props)} style={styles}>
				{node.itemType != "Title" ?
					<ReactMarkdown
						source={textWithoutHeader.length == 0 ? "New Item" : item.text}
						className={textWithoutHeader.length == 0 ? "itemContentRenderedEmpty" : "itemContentRendered"}
					/> :
					<h1 className={item.text.length == 0 ? "titleEmpty" : "title"}>{item.text.length == 0 ? "Untitled Document..." : item.text}</h1>
				}
			</div>
			{node.focused && <ItemEditor node={node} />}
		</div>
	);
}, areComponentsEqual);

const mapStateToProps = (state: ApplicationState | {}) => {
	let canEdit = false;

	if (state != {}) {
		const permissions = (state as ApplicationState).permissions;
		canEdit = permissions !== null && permissions.edit;
	}

	return {
		canEdit
	}
};

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(ItemContent);