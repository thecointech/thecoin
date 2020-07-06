import { fetchNewCoinRates, FinnhubData } from "../FinnHub";
import { RateOffsetFromMarket, CoinUpdateInterval, CoinRate } from "./types";
import { NextOpenTimestamp } from '@the-coin/utilities/MarketStatus';
import { alignToNextBoundary } from "./fetchUtils";

// var tz = require('timezone/loaded');
// const tzus = tz(require("timezone/America"));

export function fetchCoinData(latestUntil: number) {
  // we fetch from 3.5 mins prior to latest validity.
  // This is to ensure we include the candle starting 1.5 mins
  // before our last validity expired
  const fetchTimestamp = latestUntil - 6.5 * (60 * 1000);
  return fetchNewCoinRates("1", fetchTimestamp, Date.now());
}

export async function fetchCoinRate(latestValidUntil: number): Promise<CoinRate | null> {

  var data = await fetchCoinData(latestValidUntil);
  if (data == null) {
    // Fetch failed (upstream error?)
    // We can't do much about this, but we should
    // update current latest rate with new ending time.
    // TODO!
    console.error('Could not fetch Coin rates!');
    return null;
  }

  const coinRate = findRateFor(latestValidUntil, data);
  if (!coinRate) {
    console.error("Cannot find new rate");
    return null;
  }

  // How long should this validity be until?
  coinRate.validTill = await findValidUntil(Date.now(), latestValidUntil);
  return coinRate;
}

export function findRateFor(lastExpired: number, data: FinnhubData): CoinRate {

  const minuteBoundary = (lastExpired - RateOffsetFromMarket) / 1000;
  for (var i = 1; i < 6; i++) {
    // saerch back 1m at a time
    const periodStart = minuteBoundary - (i * 60);
    const idx = data.t.indexOf(periodStart);
    if (idx >= 0) {
      return {
        buy: data.l[idx] / 1000,
        sell: data.h[idx] / 1000,
        validFrom: lastExpired,
        validTill: 0
      }
    }
    //log.debug("Could not find entry for: " + periodStart);
  }

  //const cnt = data1m.t?.length ?? 0;
  //log.fatal(`Could not find coin rate for: ${ts}.  \nWe have ${data1m.t.length} rates, from ${new Date(data1m.t[0] * 1000)} => ${new Date(data1m.t[cnt - 1] * 1000)}`)
  throw new Error("RateNotFound");
}

// When should this rate expire?  It should be after now,
// it should match our update schedule, and it should only be
// while the market is open;
export async function findValidUntil(now: number, lastValidTill: number = 0)
{
  // We offset by OffsetFromMarket.  Ensure that we do not calculate
  var offset = Math.max(lastValidTill + 1, now + RateOffsetFromMarket)
  let validTill = alignToNextBoundary(offset, CoinUpdateInterval);
  // Whats the maximum time we can hold a single validity?
  let maxValidityWait = validTill + 7 * 24 * 60 * 60 * 1000;
  while (validTill < maxValidityWait) {
    // Ensure the market open
    const nextOpen = await NextOpenTimestamp(new Date(validTill), 0);
    // If no update, then our value is good as-is
    if (nextOpen == validTill)
      return validTill;
    validTill = nextOpen;

    // Align with our update schedule
    const nextBoundary = alignToNextBoundary(validTill, CoinUpdateInterval);
    // If no update, then our value is good as-is
    if (nextBoundary == validTill)
      return validTill;
    validTill = nextBoundary;
  }
  //log.error(`NextValid: ${new Date(validTill)} -> ${new Date(nextOpen)}`);
  return validTill;
}

// export async function fetchCoinRate(now: number, latestValidUntil: number) : Promise<CoinRate|null> {
//   // So we are legitimately updating.  Fetch
//     // the latest records.
//     var data = await fetchCoinData(latestValidUntil);
//     if (data == null) {
//         // Fetch failed (upstream error?)
//         // We can't do much about this, but we should
//         // update current latest rate with new ending time.
//         // TODO!
//         console.error('Could not fetch Coin rates!');
//         return null;
//     }

//     // We can only use the last item in the list,
//     // as we can only set the price for this moment
//     // forward (we can't change prices that happened
//     // in the past)
//     let keys = Object.keys(data);
//     // NOTE!!!  This code runs in the assumption that
//     // the keys are ordered (not guaranteed by spec)
//     // This could theoretically break, but the perf
//     // bonus of not sorting 100 strings is worth the risk
//     // (there is code later verifying that this value is rational)
//     const lastkey = keys[0];
//     const lastTime = Date.parse(lastkey + ' EDT');
//     console.log("Fetching for time: " + tzus(lastTime, "%F %R:%S", "America/New_York") + " at time: " + new Date().toString());

//     // Get the time this entry would be valid from
//     let validFrom = (lastTime + (60 * 1000)) + RateOffsetFromMarket;
//     let validUntil = FixCoinValidUntil(lastTime, now); //validFrom + CoinUpdateInterval;

//     // If our validFrom is less than our latest valid until,
//     // it means that the market has not yet updated.  In these
//     // cases we simply take the last value and continue using it
//     if (validFrom != latestValidUntil) {
//         if (validFrom > latestValidUntil) {
//             // We may have missed an update?  This should never actually happen, our
//             // previous validity should always extend until the new data is valid
//             console.error(`Mismatched intervals: previous Until: ${latestValidUntil}, current from: ${validFrom}`);
//         }
//         // else {
//         //     // This path occurs if the value we retrieve
//         //     // happens in the past - in this case we want
//         //     // our new validity interval simply extend
//         //     // past the last one
//         //     validUntil = latestValidUntil + CoinUpdateInterval;
//         // }
//         validFrom = latestValidUntil;
//     }

//     // Check to see that our validFrom is still in the future, and we have
//     // enough time to update with the new values (2 seconds, cause why not)
//     if (validFrom < (now + 2000)) {
//         console.error("Update is happing too late, our previous validity expired at:" + (new Date(validFrom)));
//         // We need to know this is happening, but cannot fix it in code (I think).
//     }

//     //validUntil = FixCoinValidUntil(validUntil, lastTime, now);

//     let lastEntry = data[lastkey];
//     let low = parseFloat(lastEntry["3. low"]) / 1000;
//     let high = parseFloat(lastEntry["2. high"]) / 1000;
//     return {
//       buy: low,
//       sell: high,
//       validFrom,
//       validTill: validUntil,
//     };
// }

// export function FixCoinValidUntil(lastTime: number, now: number) {
//     let fixedUntil = now
//     // If EOD, add enough time so the market is open again
//     if (tzus(lastTime, "%-HH%MM", "America/New_York") == "16H00M") {
//         // Last time is 4:00 pm.  Offset this time till market open tomorrow morning
//         let tzValidUntil = tz(lastTime, "+1 day", "-6 hours", "-29 minutes");
//         // Validate this is the correct time - valid until 30 seconds past our first data
//         if (tzus(tzValidUntil, "%R:%S", "America/New_York") !== "09:31:00") {
//             throw ("Got invalid market start time: " + tzus(tzValidUntil, "%F %R:%S", "America/New_York"));
//         }
//         // If it's a friday, skip the weekend
//         if (tzus(tzValidUntil, "%w", "America/New_York") == 6)
//             tzValidUntil = tz(tzValidUntil, "+2 days");

//         // If we are still reading yesterdays data 15 mins into the new trading day,
//         // assume the market must be closed and push the validUntil until tomorrow
//         if ((now - tzValidUntil) > 1000 * 60 * 15)
//             tzValidUntil = tz(tzValidUntil, "+1 day");

//         fixedUntil = tzValidUntil + RateOffsetFromMarket;

//         // Last check: validUntil must be at least some distance in the future
//         // This is an expected case in the first checks on a closed trading day
//         // The prior algo will calculate a time at the start of the current day,
//         // and will not skip todays values until 15 mins into the day.  For the first
//         // calculations, we don't assume the market is closed, and so just delay
//         // for the minimum time
//         while (fixedUntil < (now + RateOffsetFromMarket))
//             fixedUntil = fixedUntil + CoinUpdateInterval;

//     }
//     else {
//         fixedUntil = alignToNextBoundary(now, CoinUpdateInterval);
//     }
//     console.log('Update Validity until: ' + tzus(fixedUntil, "%F %R:%S", "America/New_York"));
//     return fixedUntil
// }
