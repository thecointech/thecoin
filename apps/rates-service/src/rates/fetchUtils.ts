import { RateOffsetFromMarket } from "./types";

const tz = require('timezone/loaded');
const tzus = tz(require("timezone/America"));

import {DateTime} from 'luxon';

export function alignToNextBoundary(timestamp: number, updateInterval: number)
{
  const initSearchDt = DateTime.fromMillis(timestamp).setZone("America/New_York");
  // start iterator on the days first boundary
  let iterator = DateTime.fromObject({
    // Clone init time, but reset to start-of-day
    ...initSearchDt.toObject(),
    // Right now, we hard-code our iterator to start at 0:31:{Offset}
    hour: 9,
    minute: 31,
    millisecond: RateOffsetFromMarket
  })

}
export function alignToNextBoundaryOld(timestamp: number, updateInterval: number)
{
    let hours = tzus(timestamp, "%H", "America/New_York");
    let minutes = tzus(timestamp, "%M", "America/New_York");
    let seconds = tzus(timestamp, "%S", "America/New_York");

    let ms = timestamp % 1000;
    // We simply discard ms
    timestamp -= ms;

    // TODO: un-hard-coded start time
    // Set to the start of the (NY) day
    let lastBoundary = tz(timestamp, `-${hours} hours`, `-${minutes} minutes`, `-${seconds} seconds`, "+31 minutes", "+30 seconds");

    // Its possible we are updating before 00:31:30, in which case lastBoundary is in the future.
    // In this case we simply offset it backwards
    if (lastBoundary > timestamp)
        lastBoundary -= updateInterval;
    else {
        // Search forward in boundary points and keep the last
        // boundary that occured before timestamp.
        let minBoundaryInterval = timestamp + RateOffsetFromMarket;
        for (let t = lastBoundary; t <= minBoundaryInterval; t += updateInterval)
            lastBoundary = t;
    }


    // and set this price to be valid until the next boundary
    return lastBoundary + updateInterval
}
