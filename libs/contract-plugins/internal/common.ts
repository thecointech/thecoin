import { toCoin, toFiat } from '../src/modifier';
import { DateTime } from 'luxon';
import type { FXRate } from '@thecointech/pricing';
import type { PluginBalanceMod } from '../src/types';

export function runModifier(balanceOf: PluginBalanceMod, fiat: number, timestamp: number) {
  const rates = [{
    buy: 2,
    sell: 2,
    fxRate: 1,
    validFrom: 0,
    validTill: Number.MIN_SAFE_INTEGER,
  } as FXRate];
  const coin = toCoin([fiat, timestamp], rates);
  const rcoin = balanceOf(coin, DateTime.fromMillis(timestamp), rates);
  return toFiat([rcoin, timestamp], rates);
}
