import * as React from 'react';

type StateProps = {

}

type AttrProps = {
	icon? : string,
	ID? : string,
	text : string,
	shortcut? : string,
	enabled? : boolean,
	callback : (event : React.MouseEvent<HTMLLIElement>) => void
}

type ComponentProps = StateProps & AttrProps;

const MenuItem : React.SFC<ComponentProps> = (props) => {
	const { icon, text, shortcut, callback, enabled, ID} = props;
	
	return (
		<li className={enabled ? "ddMenuItem" : "ddMenuItemDisabled"} id={ID ? ID : ""} onClick={enabled ? (event) => callback(event) : () => { }}>
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