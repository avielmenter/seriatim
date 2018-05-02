import * as React from 'react';

type DataProps = {
	icon : string,
	text : string,
	shortcut : string,
	buttonClass : string,
	callback : () => void
}

const ItemButton : React.SFC<DataProps> = (props : DataProps) => {
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