import { fetchNewCoinRates, FinnhubData } from "../FinnHub";
import { RateOffsetFromMarket, CoinUpdateInterval, CoinRate } from "./types";
import { NextOpenTimestamp } from '@the-coin/utilities/MarketStatus';
import { alignToNextBoundary } from "./fetchUtils";

export function fetchCoinData(latestUntil: number) {
  // we fetch from 3.5 mins prior to latest validity.
  // This is to ensure we include the candle starting 1.5 mins
  // before our last validity expired
  const fetchTimestamp = latestUntil - 6.5 * (60 * 1000);
  return fetchNewCoinRates("1", fetchTimestamp, Date.now());
}

export async function fetchCoinRate(latestValidUntil: number, now: number): Promise<CoinRate | null> {

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
  coinRate.validTill = await findValidUntil(now, latestValidUntil);
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
  // We offset by OffsetFromMarket.  Ensure that we do not calculate a validTill
  // that is less than the current validUntil
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
