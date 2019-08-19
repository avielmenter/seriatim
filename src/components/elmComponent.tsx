import * as React from 'react';

type ComponentProps = {
	src: any,
	flags?: any
}

const ElmComponent: React.SFC<ComponentProps> = (props) => {
	const { src, flags } = props;
	const appRoot = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!appRoot.current || !src || !src.init)
			return;

		src.init({
			node: appRoot.current,
			flags
		})
	});

	return (
		<div ref={appRoot}>

		</div>
	)
}

export default ElmComponent;