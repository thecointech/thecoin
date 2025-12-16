import React from 'react';
import { UxInput } from '../Input';
import { defineMessage } from 'react-intl';
import { BaseProps, SomeOptional, ValidateCB } from '../types';

const localFormat = defineMessage({
  defaultMessage: "Dates must be in the format YYYY-MM-DD",
  description: "Default placeholder for date feild"
});
const localPlaceholder = defineMessage({
  defaultMessage: "YYYY-MM-DD",
  description: "Default placeholder for date feild"
});
const localLabel = defineMessage({
  defaultMessage: "Date",
  description: "Default label for date field"
});


type Props = SomeOptional<BaseProps, "onValidate"|"placeholder"|"tooltip"|"intlLabel">
export const UxDate = (props: Props) => {

  const { onValidate, tooltip, placeholder, intlLabel, ...rest } = props;
  const addressValidate: ValidateCB = (value) => {
    return validDate(value)
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


const validDate = (value: string) => {
  const date = new Date(value);
  return !isNaN(date.getTime());
}
