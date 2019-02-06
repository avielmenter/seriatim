import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState, DispatchProps, mapDispatchToProps, handleClick } from '../../store';

import MaterialIcon from '../util/materialIcon';

type StateProps = {
	canEdit: boolean,
	children?: React.ReactNode
}

type AttrProps = {
	icon?: string,
	iconColor?: string,
	ID?: string,
	text: string,
	shortcut?: string,
	enabled?: boolean,
	enabledOnReadOnly?: boolean,
	callback: (event: React.MouseEvent<HTMLLIElement>) => void
}

type ComponentProps = StateProps & AttrProps & DispatchProps;

const MenuItem: React.SFC<ComponentProps> = (props) => {
	const { icon, iconColor, text, shortcut, callback, enabled, ID } = props;

	const platformShortcut = navigator.platform.toLowerCase().indexOf('mac') >= 0 // if user is on a mac
		? (shortcut && shortcut.replace(/ctrl/i, '⌘'))
		: shortcut;

	const enabledOnReadOnly = props.enabledOnReadOnly === true;
	const itemEnabled = (enabled == true || enabled === undefined) && (props.canEdit || enabledOnReadOnly);

	return (
		<li className={itemEnabled ? "ddMenuItem" : "ddMenuItemDisabled"} id={ID ? ID : ""}
			onClick={handleClick((event) => { if (itemEnabled) callback(event); })}>
			<div className="menuItemContent">
				<MaterialIcon icon={icon} iconColor={iconColor} />
				{text}
				{shortcut && <span className="shortcut">({platformShortcut})</span>}
			</div>
			{props.children != undefined && <div className="subMenuItems">
				<MaterialIcon icon='play_arrow' />
				{props.children}
			</div>}
		</li>
	)
}

MenuItem.defaultProps = {
	enabled: true
}

const mapStateToProps = (state: ApplicationState | {}) => {
	let canEdit: boolean = false;

	if (state != {}) {
		const appState = state as ApplicationState;
		canEdit = !appState.permissions ? false : appState.permissions.edit;
	}

	return {
		canEdit
	};
}

export default connect<StateProps, DispatchProps, AttrProps>(mapStateToProps, mapDispatchToProps)(MenuItem);