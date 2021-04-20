import * as React from 'react';
import { IsValidAddress } from '@thecointech/utilities/';
import messages from './messages';
import { UxInput } from '../UxInput';
import { ChangeCB } from '../UxInput/types';
import { MessageDescriptor } from 'react-intl';
import { useState } from 'react';

type MyProps = {
	forceValidate?: boolean,
	placeholder?: string,
	intlLabel?: MessageDescriptor,
	uxChange: ChangeCB
}

export const UxAddress = (props:MyProps) => {
	const [account, setAccount] = useState("");
	const [isValid, setIsValid] = useState(false);
	const [message] = useState(undefined as MessageDescriptor | undefined);

	// Validate our inputs
	function onAccountValue(value: string) {
		const isValidTemp = IsValidAddress(value)
		setAccount(value);
		setIsValid(isValidTemp);
		if (isValid)
			props.uxChange(value)
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
