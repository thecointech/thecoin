import { getPluginModifier, toCoin, toFiat } from '../src/modifier';
import { DateTime } from 'luxon';
import type { FXRate } from '@thecointech/pricing';
import type { PluginBalanceMod } from '../src/types';
import { ALL_PERMISSIONS } from '../src/constants';
import { BigNumber } from '@ethersproject/bignumber';
import Decimal from 'decimal.js-light';

export function runModifier(balanceOf: PluginBalanceMod, fiat: number, timestamp: number) {
  const rates = [{
    buy: 2,
    sell: 2,
    fxRate: 1,
    validFrom: Number.MIN_SAFE_INTEGER,
    validTill: Number.MAX_SAFE_INTEGER,
  } as FXRate];
  const ts = new Decimal(timestamp)
  const coin = toCoin([new Decimal(fiat), ts], rates);
  const rcoin = balanceOf(coin, DateTime.fromMillis(timestamp), rates);
  return toFiat([rcoin, ts], rates);
}

export const user = "0x1234567890123456789012345678901234567890";
const permissions = BigNumber.from(ALL_PERMISSIONS);
export const getModifier = async (plugin: string) => {
  const r = await getPluginModifier(user, { plugin, permissions } as any);

  return (fiat: number, timestamp: number) => {
    return runModifier(r, fiat, timestamp);
  }
}
