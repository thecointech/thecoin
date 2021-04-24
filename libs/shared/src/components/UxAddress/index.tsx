import * as React from 'react';
import { IsValidAddress } from '@thecointech/utilities/';
import messages from './messages';
import { UxInput } from '../UxInput';
import { MessageDescriptor } from 'react-intl';
import { useState } from 'react';

type MyProps = {
	forceValidate?: boolean,
	placeholder?: string,
	intlLabel?: MessageDescriptor,
	uxChange: (e:React.FormEvent<HTMLInputElement>) => void
}

export const UxAddress = (props:MyProps) => {
	const [account, setAccount] = useState("");
	const [isValid, setIsValid] = useState(false);
	const [message] = useState(undefined as MessageDescriptor | undefined);

	// Validate our inputs
	function onAccountValue(event: React.FormEvent<HTMLInputElement>) {
		const isValidTemp = IsValidAddress(event.currentTarget.value)
		setAccount(event.currentTarget.value);
		setIsValid(isValidTemp);
		if (isValid)
			props.uxChange(event)
	}

	return(
		<UxInput
			intlLabel={messages.labelAccount}
			{...account}
			{...isValid}
			{...message}
			{...props}
			uxChange={onAccountValue}
		/>
	);
}
