import * as React from 'react';
import { IsValidAddress, NormalizeAddress } from '@thecointech/utilities';
import { UxInput } from '../Input';
import { defineMessage } from 'react-intl';
import { BaseProps, SomeOptional, ValidateCB } from '../types';

const format = defineMessage({
  defaultMessage: "An address is 40 characters long, and consists only of numbers and the letters A-F",
  description: "Describe a valid format for an ethereum address"
});
const localPlaceholder = defineMessage({
  defaultMessage: "An ethereum address",
  description: "shared.uxaddress.address.error: Error Message for the address field in make a payment / coin transfer"
});
const localLabel = defineMessage({
  defaultMessage: "Address",
  description: "Default label for ethereum address field"
});

type Props = SomeOptional<BaseProps, "onValidate"|"placeholder"|"tooltip"|"intlLabel">
export const UxAddress = (props: Props) => {

  const { onValidate, tooltip, placeholder, intlLabel, onValue, ...rest } = props;
  const addressValidate: ValidateCB = (value) =>
    IsValidAddress(value) && (onValidate?.(value) ?? true)
      ? null
      : format;
  const onAddress = (value?: string) => {
    onValue(value ? NormalizeAddress(value) : value)
  }

  return (
    <UxInput
      onValidate={addressValidate}
      onValue={onAddress}
      placeholder={placeholder ?? localPlaceholder}
      tooltip={tooltip ?? format}
      intlLabel={intlLabel ?? localLabel}
      {...rest}
    />
  );
}
