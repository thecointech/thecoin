import * as React from 'react';
import { IsValidAddress } from '@the-coin/utilities';
import messages from './messages';
import { UxInput } from '../UxInput';
import { ChangeCB } from '../UxInput/types';

type MyProps = {
	forceValidate?: boolean,
	placeholder?: string,
	intlLabel?: ReactIntl.FormattedMessage.MessageDescriptor,
	uxChange: ChangeCB
}

class UxAddress extends React.PureComponent<MyProps> {

	state = {
		account: "",
		isValid: undefined,
		message: undefined as ReactIntl.FormattedMessage.MessageDescriptor | undefined,
	};

	// Validate our inputs
	onAccountValue = (value: string) => {
		const isValid = IsValidAddress(value)
		this.setState({
			account: value,
			isValid
		});
		if (isValid)
			this.props.uxChange(value)
	}

	render() {
		return (
			<UxInput
				intlLabel={messages.labelAccount}
				{...this.state}
				{...this.props}
				uxChange={this.onAccountValue}
			/>
		);
	}
}

export { UxAddress };

