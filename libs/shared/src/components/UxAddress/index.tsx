import * as React from 'react';
import { IsValidAddress } from '@thecointech/utilities';
import { UxInput } from '../UxInput';
import { MessageDescriptor } from 'react-intl';
import { useState } from 'react';
import { ChangeCB } from 'components/UxInput/types';

const labelAddress = { id:"shared.uxaddress.address.label",
                defaultMessage:"Account",
                description:"Label for the address field in make a payment / coin transfer" };

const errorMessage = { id:"shared.uxaddress.address.error",
                defaultMessage:"This address is not the right format",
                description:"Error Message for the address field in make a payment / coin transfer" };

type MyProps = {
	forceValidate?: boolean,
	placeholder?: string,
	intlLabel?: MessageDescriptor,
	uxChange: ChangeCB
}

export const UxAddress = (props:MyProps) => {
	const [account, setAccount] = useState("");
	const [isValid, setIsValid] = useState(false);
	const [message, setMessage] = useState(undefined as MessageDescriptor | undefined);

	// Validate our inputs
	function onAccountValue(value: string) {
		const isValidTemp = IsValidAddress(value)
		setAccount(value);
		setIsValid(isValidTemp);
		if (!isValidTemp){
			setMessage(errorMessage);
		}
		if (isValid)
			props.uxChange(value)
	}

	return(
		<UxInput
			intlLabel={labelAddress}
			value={account}
			isValid={isValid}
			message={message}
			{...props}
			uxChange={onAccountValue}
		/>
	);
}
