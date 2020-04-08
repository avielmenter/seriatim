import * as React from 'react';
import * as dateFormat from 'dateformat';

type StateProps = {

}

type AttrProps = {
	date?: Date
}

type ComponentProps = StateProps & AttrProps;

function getFriendlyDateString(date?: Date): string {
	if (!date)
		return "never";

	const now = new Date();

	const minutes = (now.getTime() - date.getTime()) / 1000 / 60;
	const hours = minutes / 60;

	if (minutes < 1)
		return 'Just now';
	else if (minutes < 2)
		return '1 minute ago';
	else if (hours < 1)
		return Math.floor(minutes) + ' minutes ago';
	else if (hours < 2)
		return '1 hour ago';
	else if (hours < 24)
		return Math.floor(hours) + ' hours ago';
	else if (now.getFullYear() != date.getFullYear())
		return dateFormat(date, 'mmm d, yyyy');
	else if (now.getMonth() != date.getMonth())
		return dateFormat(date, 'd mmmm');
	else if (now.getDate() - date.getDate() == 1)
		return 'yesterday';
	else
		return (now.getDate() - date.getDate()) + ' days ago';
}

const FriendlyDate: React.SFC<ComponentProps> = (props) => {
	const [friendlyDateString, setFriendlyDateString] = React.useState<string>(getFriendlyDateString(props.date));

	React.useEffect(() => {
		let interval = setInterval(() => setFriendlyDateString(getFriendlyDateString(props.date)), 1000 * 60);
		return () => clearInterval(interval);
	});

	React.useEffect(() => { setFriendlyDateString(getFriendlyDateString(props.date)); }, [props.date]);

	return (
		<span className="friendlyDate" title={props.date?.toString()}>
			{friendlyDateString}
		</span>
	);
};

export default FriendlyDate;