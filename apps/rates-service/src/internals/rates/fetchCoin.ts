import { fetchNewCoinRates, FinnhubData } from "../FinnHub";
import { RateOffsetFromMarket, CoinUpdateInterval, CoinRate } from "./types";
import { nextOpenTimestamp } from '@thecointech/market-status';
import { alignToNextBoundary } from "./fetchUtils";
import { DateTime } from 'luxon';
import { log } from '@thecointech/logging';

export async function fetchCoinData(latestUntil: number) {
  // we fetch from 6.5 mins prior to latest validity.
  // This is to ensure we include the candle starting 1.5 mins
  // before our last validity expired
  const now = DateTime.now();
  // We can only fetch
  let fetchTimestamp = Math.max(
    latestUntil - 6.5 * (60 * 1000),
    now.minus({days: 3}).toMillis()
  );
  return fetchNewCoinRates("1", fetchTimestamp, now.toMillis());
}

export async function fetchCoinRate(latestValidUntil: number, now: number) {

  var data = await fetchCoinData(latestValidUntil);
  let nextValid = latestValidUntil;
  var rates = [] as CoinRate[];
  while (nextValid < now)
  {
    const coinRate = findRateFor(nextValid, data);
    const minValidity = Math.max(nextValid, data.t[0] * 1000);
    nextValid = coinRate.validTill = await findValidUntil(minValidity);
    rates.push(coinRate);
  }

  // How long should this validity be until?
  return rates;
}

export function findRateFor(lastExpired: number, data: FinnhubData): CoinRate {

  const response = (idx: number) => ({
    // Our buy/sell price should now be equal
    buy: (data.l[idx] + data.h[idx]) / 2000,
    sell: (data.l[idx] + data.h[idx]) / 2000,
    validFrom: lastExpired,
    validTill: 0
  })

  // We have per-minute values.  So round back to the
  // last minute, then multiply back to seconds
  const boundary = Math.floor(lastExpired / (60 * 1000)) * 60;

  // If we are out-of-range, we return the earliest
  // value we have.  This happens on init or if
  // potentially google services went down for several days
  if (boundary < data.t[0]) {
    log.warn({ lastExpired }, `Out of range rates when updating from {lastExpired}`);
    return response(0);
  }

  for (var i = 1; i < 6; i++) {
    // saerch back 1m at a time
    const periodStart = boundary - (i * 60);
    const idx = data.t.indexOf(periodStart);
    if (idx >= 0) {
      return response(idx);
    }
  }

  const cnt = data.t?.length ?? 0;
  log.fatal(`Could not find coin rate for: ${DateTime.fromMillis(lastExpired)}.  \nWe have ${data.t.length} rates, from ${DateTime.fromSeconds(data.t[0])} => ${DateTime.fromSeconds(data.t[cnt - 1])}`);
  throw new Error("RateNotFound");
}

// When should this rate expire?  It should be after now,
// it should match our update schedule, and it should only be
// while the market is open;
export async function findValidUntil(lastValidTill: number)
{
  // We offset by OffsetFromMarket.  Ensure that we do not calculate a validTill
  // that is less than the current validUntil
  var offset = lastValidTill + RateOffsetFromMarket;
  let validTill = alignToNextBoundary(offset, CoinUpdateInterval);
  // Whats the maximum time we can hold a single validity?
  let maxValidityWait = validTill + 7 * 24 * 60 * 60 * 1000;
  while (validTill < maxValidityWait) {
    // Ensure the market open
    const nextOpen = await nextOpenTimestamp(DateTime.fromMillis(validTill), 0);
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
