import * as React from 'react';

type StateProps = {

}

type AttrProps = {
	icon?: string
}

type ComponentProps = StateProps & AttrProps;

const MaterialIcon: React.SFC<ComponentProps> = (props) => {
	const { icon } = props;

	return (
		<i className='material-icons'>{icon != undefined && icon.trim() != '' ? icon : ''}</i>
	);
}

export default MaterialIcon;