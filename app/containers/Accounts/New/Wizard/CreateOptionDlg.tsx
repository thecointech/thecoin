import React from 'react';
import { ModalOperation } from "@the-coin/components/containers/ModalOperation";
import { FormattedMessage } from 'react-intl';
import { Option } from './Options/Types';
import Cookies from 'js-cookie'
import { withRouter, RouteComponentProps } from 'react-router-dom'


type MyProps = {
	option: Option
	onCancel: () => void
}
type Props = MyProps & RouteComponentProps;

export const CreateOptionDlg = withRouter((props: Props) => {

	const {option, onCancel} = props;
	const {messages} = option;

	const onOk = () => {
		Cookies.set('createOptions', props.option, { expires: 7 });
		props.history.push('/accounts/create')
	}

	return <ModalOperation
		cancelCallback={onCancel}
		okCallback={onOk}
		isOpen={true}
		header={messages.header}
		progressPercent={1}
	>
		<p><FormattedMessage {...messages.description}></FormattedMessage></p>
		<p>Auth: <FormattedMessage {...messages.auth}></FormattedMessage></p>
		<p>Pros: <FormattedMessage {...messages.pros}></FormattedMessage></p>
		<p>Cons: <FormattedMessage {...messages.cons}></FormattedMessage></p>
	</ModalOperation>
});