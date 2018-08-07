import * as React from 'react';
import * as dateFormat from 'dateformat';

type StateProps = {

}

type AttrProps = {
	date?: Date
}

type ComponentProps = StateProps & AttrProps;

class FriendlyDate extends React.Component<ComponentProps> {
	refreshInternal?: number;

	getFriendlyDateString(date?: Date): string {
		if (!date)
			return "never";

		const now = new Date();

		if (now.getFullYear() != date.getFullYear())
			return dateFormat(date, 'mmm d, yyyy');
		else if (now.getDay() != date.getDay())
			return dateFormat(date, 'd mmmm');
		else if (now.getHours() - date.getHours() == 1)
			return '1 hour ago';
		else if (now.getHours() != date.getHours())
			return (now.getHours() - date.getHours()) + ' hours ago';
		else if (now.getMinutes() - date.getMinutes() == 1)
			return '1 minute ago';
		else if (now.getMinutes() != date.getMinutes())
			return (now.getMinutes() - date.getMinutes()) + ' minutes ago';
		else
			return 'Just now';
	}

	componentDidMount() {
		this.refreshInternal = window.setInterval(() => this.setState({
			date: this.props.date
		}), 60 * 1000);
	}

	componentWillUnmount() {
		if (this.refreshInternal !== undefined)
			clearInterval(this.refreshInternal);
	}

	render() {
		const { date } = this.props;

		return (
			<span className="friendlyDate">{this.getFriendlyDateString(date)}</span>
		);
	}
}

export default FriendlyDate;