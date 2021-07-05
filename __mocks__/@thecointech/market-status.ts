

import { DateTime } from 'luxon';
import type * as MarketStatus from '@thecointech/market-status';

export const nextOpenTimestamp: typeof MarketStatus.nextOpenTimestamp = (date: DateTime, offset: number = 120 * 1000) =>
  Promise.resolve(nextLikelyOpen(date, offset).toMillis())

const nextLikelyOpen = (date: DateTime, offset: number) => {
  const local = date.setZone("America/New_York");
  if (local.weekday > 5) {
    return local  // Is weekend?
      .plus({days: 8 - local.weekday})
      .set({ hour: 9, minute: 30 })
      .plus({milliseconds: offset})
  }
  if (local.hour < 9) return local.set({ hour: 9, minute: 30 }).plus({milliseconds: offset})
  if (local.hour >= 16) return local.plus({days: 1}).set({ hour: 9, minute: 30 }).plus({milliseconds: offset});
  return date;
}
