import * as React from 'react';
import { IsValidAddress } from '@thecointech/utilities';
import messages from './messages';
import { UxInput } from '../UxInput';
import { ChangeCB } from '../UxInput/types';
import { MessageDescriptor } from 'react-intl';

type MyProps = {
	forceValidate?: boolean,
	placeholder?: string,
	intlLabel?: MessageDescriptor,
	uxChange: ChangeCB
}

class UxAddress extends React.PureComponent<MyProps> {

	state = {
		account: "",
		isValid: undefined,
		message: undefined as MessageDescriptor | undefined,
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

