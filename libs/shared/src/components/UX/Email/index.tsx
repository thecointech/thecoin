import * as React from 'react';
import { UxInput } from '../Input';
import { defineMessage } from 'react-intl';
import { validEmail } from '@thecointech/utilities/VerifiedSale';
import { BaseProps, SomeOptional, ValidateCB } from '../types';

const localFormat = defineMessage({
  defaultMessage: "An email address requires the '@' symbol",
  description: "Default placeholder for email feild"
});
const localPlaceholder = defineMessage({
  defaultMessage: "An email address",
  description: "Default placeholder for email feild"
});
const localLabel = defineMessage({
  defaultMessage: "Email",
  description: "Default label for email field"
});

type Props = SomeOptional<BaseProps, "onValidate"|"placeholder"|"tooltip"|"intlLabel">
export const UxEmail = (props: Props) => {

  const { onValidate, tooltip, placeholder, intlLabel, ...rest } = props;
  const addressValidate: ValidateCB = (value) => {
    return value?.match(validEmail())
      ? onValidate?.(value) ?? null
      : localFormat;
  }

  return (
    <UxInput
      onValidate={addressValidate}
      placeholder={placeholder ?? localPlaceholder}
      tooltip={tooltip ?? localFormat}
      intlLabel={intlLabel ?? localLabel}
      {...rest}
    />
  );
}
