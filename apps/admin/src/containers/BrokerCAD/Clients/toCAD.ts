import { COIN_EXP } from '@thecointech/contract-core';
import { FXRate, weBuyAt } from '@thecointech/fx-rates';
import { Decimal } from 'decimal.js-light';

// How is this not a common function yet???
export const toCAD = (coin: Decimal, rates: FXRate[]) =>
  `$${coin
    .mul(weBuyAt(rates))
    .div(COIN_EXP)
    .toFixed(2)
  }`
