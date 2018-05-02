import * as React from 'react';

type StateProps = {

}

type AttrProps = {
	icon? : string,
	text : string,
	shortcut? : string,
	enabled? : boolean,
	callback : () => void
}

type ComponentProps = StateProps & AttrProps;

const MenuItem : React.SFC<ComponentProps> = (props) => {
	const { icon, text, shortcut, callback, enabled } = props;
	
	return (
		<li className={enabled ? "ddMenuItem" : "ddMenuItemDisabled"} onClick={enabled ? () => {} : callback}>
			<span className="icon">{icon || " "}</span>
			{text}
			{shortcut && <span className="shortcut">({shortcut})</span>}
		</li>
	)
}

MenuItem.defaultProps = {
	enabled: true
}

export default MenuItem;