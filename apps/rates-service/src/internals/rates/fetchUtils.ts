import { RateOffsetFromMarket } from "./types";
import { DateTime } from 'luxon';

export function alignToNextBoundary(timestamp: number, updateInterval: number) : number {
  const initSearchDt = DateTime.fromMillis(timestamp);
  // In order to handle leap years, we start our iterator at the one time of day we
  // know we want to hit; 9:31:30 am
  let iterator = DateTime.fromObject({
    // Clone init time, but reset to start-of-day
    ...initSearchDt.toObject(),
    // Right now, we hard-code our iterator to start at 0:31:{Offset}
    hour: 9,
    minute: 31,
    second: 0,
    millisecond: 0,
    //millisecond: RateOffsetFromMarket
  }, { zone: initSearchDt.zone }).plus({milliseconds: RateOffsetFromMarket});

  // Now, we search to find the boundary immediately after timestamp
  return (initSearchDt < iterator)
    ? searchBackForBoundary(initSearchDt, iterator, updateInterval)
    : searchForwardForBoundary(initSearchDt, iterator, updateInterval);
}

function searchBackForBoundary(init: DateTime, iterator: DateTime, interval: number) {
  let r = iterator;
  do {
    const lastDst = iterator.isInDST;
    iterator = iterator.minus(interval);
    // Ensure our validity intervals respect DST, and
    // always align with the correct calendar clock
    if (lastDst != iterator.isInDST)
      iterator = fixDst(iterator, lastDst);

    if (iterator <= init)
      return r.toMillis();
    r = iterator;
  } while (iterator.day == init.day);
  // It is not possible to go backwards but not find a boundary
  throw new Error(`Boundary not found searching back from ${iterator} for ${init}`);
}

function searchForwardForBoundary(init: DateTime, iterator: DateTime, interval: number) {
  do {
    iterator = iterator.plus(interval);
    if (iterator > init)
      return iterator.toMillis();
  } while (iterator.day == init.day);
  // It is not possible to go backwards but not find a boundary
  throw new Error(`Boundary not found searching fwd from ${iterator} for ${init}`);
}

// We wish to align with calendar clock, so if we
// cross the DST boundary offset our thingy to match
// Note: this is only necessary if Offset > 1hr
const fixDst = (dt: DateTime, lastDst: boolean) =>
  lastDst
    ? dt.plus({hour: 1})
    : dt.minus({hour: 1})
