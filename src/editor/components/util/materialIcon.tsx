import * as React from 'react';

type StateProps = {

}

type AttrProps = {
	icon?: string,
	iconColor?: string
}

type ComponentProps = StateProps & AttrProps;

const MaterialIcon: React.SFC<ComponentProps> = (props) => {
	const { icon, iconColor } = props;

	return (
		<i className='material-icons' style={{ color: iconColor }}>
			{icon != undefined && icon.trim() != '' ? icon : ''}
		</i>
	);
}

export default MaterialIcon;