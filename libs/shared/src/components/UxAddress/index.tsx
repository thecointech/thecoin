import * as React from 'react';
import { IsValidAddress } from '@thecointech/utilities';
import { UxInput } from '../UxInput';
import { defineMessages, MessageDescriptor } from 'react-intl';
import { useState } from 'react';
import { ChangeCB } from '../UxInput/types';

const translate = defineMessages({ 
		labelAddress : {
                defaultMessage:"Account",
                description:"shared.uxaddress.address.label: Label for the address field in make a payment / coin transfer" },
		errorMessage : { 
                defaultMessage:"This address is not the right format",
                description:"shared.uxaddress.address.error: Error Message for the address field in make a payment / coin transfer" }});

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
			setMessage(translate.errorMessage);
		}
		if (isValid)
			props.uxChange(value)
	}

	return(
		<UxInput
			intlLabel={translate.labelAddress}
			value={account}
			isValid={isValid}
			message={message}
			{...props}
			uxChange={onAccountValue}
		/>
	);
}
