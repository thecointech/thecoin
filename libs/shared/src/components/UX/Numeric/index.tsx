import React from 'react';
import { defineMessage } from 'react-intl';
import { UxInput } from '../Input';
import { BaseProps, ValidateCB } from '../types';
import styles from './styles.module.less';

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

export type UxNumericType = "percent"|"currency"|"decimal"|"years";

type Props = Omit<BaseProps<number>, "onValidate"> & {
  onValidate: ValidateCB<number|undefined>
  max?: number,
  min?: number,
  type?: UxNumericType,
}

export const UxNumeric = (props: Props) => {
  const { onValidate, onValue, defaultValue, type, max, min, ...rest } = props;
  const mult = type === "percent" ? 100 : 1;

  const toNumValidate = (value: string, name?: string) => {
    const num = convertOut(value, mult);
    if (Number.isNaN(num)) return errNotANum;
    if (num) {
      if (min !== undefined && num < min) return {...errTooLow, values: {min}};
      if (max !== undefined && num > max) return {...errTooHigh, values: {max}};
    }
    return onValidate?.(num, name) ?? null
  }

  const toNumValue = (value?: string, name?: string) =>
    onValue(convertOut(value, mult), name);

  return (
    <UxInput
      className={`${styles.numeric} ${getTypeStyle(type)} ${props.className ?? ''}`}
      onValidate={toNumValidate}
      onValue={toNumValue}
      defaultValue={convertIn(defaultValue, mult)}
      type='number'
      {...rest}
    />
  );
}

const convertIn = (value: number|undefined, mult: number) =>
  value !== undefined
    ? (value * mult).toString()
    : undefined

const convertOut = (value: string | undefined, mult: number) =>
  value !== undefined
    ? Number(value) / mult
    : undefined;

const getTypeStyle = (type: string | undefined) =>
  type
    ? `${styles.symbol} ${styles[type]}`
    : ''
