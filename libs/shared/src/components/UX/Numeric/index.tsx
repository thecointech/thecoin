import React from 'react';
import { defineMessage } from 'react-intl';
import { UxInput } from '../Input';
import { BaseProps, ValidateCB } from '../types';

const errNotANum = defineMessage({
  defaultMessage: "Please enter a valid number",
  description: "UxNumeric error value too low"
});
const errTooLow = defineMessage({
  defaultMessage: "Must be larger than {min}",
  description: "UxNumeric error value too low"
});
const errTooHigh = defineMessage({
  defaultMessage: "Must be less than {max}",
  description: "UxNumeric error value too high"
});

type Props = Omit<BaseProps<number>, "onValidate"> & {
  onValidate: ValidateCB<number|undefined>
  max?: number,
  min?: number,
}

export const UxNumeric = (props: Props) => {
  const { onValidate, onValue, defaultValue, max, min, ...rest } = props;

  const toNumValidate = (value: string, name?: string) => {
    const num = value === ""
      ? undefined
      : Number(value);
    if (Number.isNaN(num)) return errNotANum;
    if (num) {
      if (min !== undefined && num < min) return {...errTooLow, values: {min}};
      if (max !== undefined && num > max) return {...errTooHigh, values: {max}};
    }
    return onValidate?.(num, name) ?? null
  }
  const toNumValue = (value?: string, name?: string) => onValue(value ? Number(value) : undefined, name);

  return (
    <UxInput
      onValidate={toNumValidate}
      onValue={toNumValue}
      defaultValue={defaultValue?.toString()}
      {...rest}
    />
  );
}
