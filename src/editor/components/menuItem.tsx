import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState, DispatchProps, mapDispatchToProps } from '../store';

type StateProps = {
	canEdit: boolean,
}

type AttrProps = {
	icon?: string,
	ID?: string,
	text: string,
	shortcut?: string,
	enabled?: boolean,
	enabledOnReadOnly?: boolean,
	callback: (event: React.MouseEvent<HTMLLIElement>) => void
}

type ComponentProps = StateProps & AttrProps & DispatchProps;

const MenuItem: React.SFC<ComponentProps> = (props) => {
	const { icon, text, shortcut, callback, enabled, ID } = props;

	const enabledOnReadOnly = props.enabledOnReadOnly === true;
	const itemEnabled = (enabled == true || enabled === undefined) && (props.canEdit || enabledOnReadOnly);

	return (
		<li className={itemEnabled ? "ddMenuItem" : "ddMenuItemDisabled"} id={ID ? ID : ""} onClick={itemEnabled ? (event) => callback(event) : () => { }}>
			<span className="icon">{icon || " "}</span>
			{text}
			{shortcut && <span className="shortcut">({shortcut})</span>}
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