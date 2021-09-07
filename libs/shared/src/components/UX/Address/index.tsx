import * as React from 'react';
import { IsValidAddress } from '@thecointech/utilities';
import { UxInput } from '../Input';
import { defineMessage } from 'react-intl';
import { Props as BaseProps, ValidateCB } from '../types';

const format = defineMessage({
  defaultMessage: "An address is 40 characters long, and consists only of numbers and the letters A-F",
  description: "Describe a valid format for an ethereum address"
});
const localPlaceholder = defineMessage({
  defaultMessage: "An ethereum address",
  description: "shared.uxaddress.address.error: Error Message for the address field in make a payment / coin transfer"
});

type localProps = "onValidate"|"placeholder"|"tooltip";
type Props = Omit<BaseProps, localProps> & Partial<Pick<BaseProps, localProps>>
export const UxAddress = (props: Props) => {

  const { onValidate, tooltip, placeholder, ...rest } = props;
  const addressValidate: ValidateCB = (value) =>
    IsValidAddress(value) && (onValidate?.(value) ?? true)
      ? null
      : format;

  return (
    <UxInput
      onValidate={addressValidate}
      placeholder={placeholder ?? localPlaceholder}
      tooltip={tooltip ?? format}
      {...rest}
    />
  );
}
