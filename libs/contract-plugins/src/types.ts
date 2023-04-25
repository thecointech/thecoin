import type { FXRate } from '@thecointech/fx-rates';
import type Decimal from 'decimal.js-light';
import type { DateTime } from 'luxon';


export type ContractState = Record<string, string | Decimal | Record<string, any>>;
export type PluginBalanceMod = (balance: Decimal, timestamp: DateTime, rates: FXRate[]) => Decimal;
export type PluginDetails = {
  address: string;
  permissions: Decimal;
  emulator: PluginBalanceMod | null;
}
