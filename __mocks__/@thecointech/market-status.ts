

import { DateTime } from 'luxon';
import type * as MarketStatus from '@thecointech/market-status';

export const nextOpenTimestamp: typeof MarketStatus.nextOpenTimestamp =
  (date: DateTime, _offset: number=120 * 1000) => Promise.resolve(date.toMillis());
