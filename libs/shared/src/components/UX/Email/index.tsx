import * as React from 'react';
import { UxInput } from '../Input';
import { defineMessage } from 'react-intl';
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
    const split = value?.indexOf('@');
    if (split > 0 && (split + 1) < value?.length)
      return onValidate?.(value) ?? null;
    return localFormat;
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
