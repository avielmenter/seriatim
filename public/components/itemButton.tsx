import * as React from 'react';

type AttrProps = {
	icon : string,
	text : string,
	shortcut : string,
	buttonClass : string,
	callback : () => void
}

type StateProps = {

}

type ComponentProps = AttrProps & StateProps;

const ItemButton : React.SFC<ComponentProps> = (props : ComponentProps) => {
	const { icon, text, shortcut, callback, buttonClass } = props;

	return (
		<button title={text} onClick={callback} className={buttonClass}>
			<span className="buttonIcon">{icon}</span>
			<span className="buttonText">{text}</span>
			<span className="buttonShortcut">({shortcut})</span>
		</button>
	);
}

export default ItemButton;