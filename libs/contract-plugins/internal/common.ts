import { toCoin, toFiat } from '../src/modifier';
import { DateTime } from 'luxon';
import type { FXRate } from '@thecointech/pricing';
import type { PluginBalanceMod } from '../src/types';
import Decimal from 'decimal.js-light';

export function runModifier(balanceOf: PluginBalanceMod, fiat: number, timestamp: number) {
  const rates = [{
    buy: 2,
    sell: 2,
    fxRate: 1,
    validFrom: Number.MIN_SAFE_INTEGER,
    validTill: Number.MAX_SAFE_INTEGER,
  } as FXRate];
  const ts = new Decimal(timestamp).div(1000)
  const coin = toCoin([new Decimal(fiat), ts], rates);
  const rcoin = balanceOf(coin, DateTime.fromMillis(timestamp), rates);
  return toFiat([rcoin, ts], rates);
}
