import React from 'react';
import {FormattedNumber} from 'react-intl';
import { CurrencyKey } from '@thecointech/utilities/CurrencyCodes'

type DisplayLength = "long" | "short" | undefined;
type CurrencyDisplay = "symbol" | "code" | "name" | "narrowSymbol" | undefined;

const defaultProps = {
  currency: "CAD" as CurrencyKey,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  compactDisplay: "short" as DisplayLength,
  currencyDisplay: "narrowSymbol" as CurrencyDisplay,
}

export type Props = {
  value: number,
} & Partial<typeof defaultProps>;

export const Currency = (props: Props) => (
    <FormattedNumber
      style="currency"
      {...defaultProps}
      {...props}
    />
)
