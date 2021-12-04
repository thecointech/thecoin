import {fetchRate, CurrencyKey} from "@thecointech/fx-rates";
import { Decimal } from 'decimal.js-light';
import { COIN_EXP } from '@thecointech/contract-core';
import { DateTime } from 'luxon';

export const toCoin = async (date: DateTime, fiat: Decimal, currency: CurrencyKey) => {
  const d = date.toJSDate();
  const rate = await fetchRate(d);
  if (!rate) throw new Error("Missing FXRate");
  let usd = fiat;
  // Convert to USD
  if (currency == "CAD")
    usd = usd.div(rate.fxRate);
  // Conver to Coin
  return usd
    .mul(COIN_EXP)
    .div(fiat.gt(0) ? rate.sell : rate.buy)
    .toint()
}
