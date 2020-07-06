import { RateOffsetFromMarket } from "./types";
import { DateTime } from 'luxon';

export function alignToNextBoundary(timestamp: number, updateInterval: number) : number {
  const initSearchDt = DateTime.fromMillis(timestamp).setZone("America/New_York");
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
    zone: initSearchDt.zone
    //millisecond: RateOffsetFromMarket
  }).plus({milliseconds: RateOffsetFromMarket});

  // Now, we search to find the boundary immediately after timestamp
  return (initSearchDt < iterator)
    ? searchBackForBoundary(initSearchDt, iterator, updateInterval)
    : searchForwardForBoundary(initSearchDt, iterator, updateInterval);
}

function searchBackForBoundary(init: DateTime, iterator: DateTime, interval: number) {
  let r = iterator;
  do {
    iterator = iterator.minus(interval);
    if (iterator < init)
      return r.toMillis();
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

// export function alignToNextBoundaryOld(timestamp: number, updateInterval: number)
// {
//     let hours = tzus(timestamp, "%H", "America/New_York");
//     let minutes = tzus(timestamp, "%M", "America/New_York");
//     let seconds = tzus(timestamp, "%S", "America/New_York");

//     let ms = timestamp % 1000;
//     // We simply discard ms
//     timestamp -= ms;

//     // TODO: un-hard-coded start time
//     // Set to the start of the (NY) day
//     let lastBoundary = tz(timestamp, `-${hours} hours`, `-${minutes} minutes`, `-${seconds} seconds`, "+31 minutes", "+30 seconds");

//     // Its possible we are updating before 00:31:30, in which case lastBoundary is in the future.
//     // In this case we simply offset it backwards
//     if (lastBoundary > timestamp)
//         lastBoundary -= updateInterval;
//     else {
//         // Search forward in boundary points and keep the last
//         // boundary that occured before timestamp.
//         let minBoundaryInterval = timestamp + RateOffsetFromMarket;
//         for (let t = lastBoundary; t <= minBoundaryInterval; t += updateInterval)
//             lastBoundary = t;
//     }


//     // and set this price to be valid until the next boundary
//     return lastBoundary + updateInterval
// }
