import { toCoin, toFiat } from './modifier';
import { DateTime } from 'luxon';
import type { FXRate } from '@thecointech/pricing';
import type { PluginEmulator } from './types';

export function runModifier(emulator: PluginEmulator, fiat: number, timestamp: number) {
  const rates = [{
    buy: 2,
    sell: 2,
    fxRate: 1,
    validFrom: 0,
    validTill: Number.MIN_SAFE_INTEGER,
  } as FXRate];
  const coin = toCoin([fiat, timestamp], rates);
  const rcoin = emulator.balanceOf(coin, DateTime.fromSeconds(timestamp), rates);
  return toFiat([rcoin, timestamp], rates);
}

it ("needs empty test to run", () => {})
