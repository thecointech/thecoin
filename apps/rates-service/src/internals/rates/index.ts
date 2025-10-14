import { RateKey, CombinedRates, CoinRate, FxRates, RateTypes } from "./types";
import { getLatest } from "./latest";
import { CurrencyCode, validFor } from "@thecointech/fx-rates";
import { getRate } from "./db";
import { updateRates } from "./UpdateDb";
import { log } from "@thecointech/logging";
export { updateRates } from './UpdateDb'

//
// entry point for anything external to the rates folder
//

async function getRates<K extends RateKey>(key: K, timestamp: number) : Promise<RateTypes[K]|null> {
  // log.trace("getting rates for {FxKey} at {Timestamp}", key, timestamp);

  // We don't support future times
  if (timestamp > Date.now())
    return null;

  // Double check this is not for the future
  let latest = getLatest(key);

  // If latest matches, return it
  if (validFor(latest, timestamp)) {
    return latest as RateTypes[K];
  }

  // get from DB
  let rate = await getRate(key, timestamp);
  if (rate != null)
    return rate as RateTypes[K];

  // Finally, if something has gone really wrong with our updates, try forcing it.
  // This shouldn't happen, it is most likely an error condition.
  log.error(
    { FxKey: key, Timestamp: timestamp },
    "Could not find {FxKey} for {Timestamp}, forcing update",
  );

  const updated = await updateRates();
  if (updated) {
    // Try again.  This won't loop because once
    // it succeeds the second call will be false.
    return await getRates(key, timestamp);
  }
  // Nothing doing, return null
  return null;
}

export async function getCombinedRates(timestamp?: number) : Promise<CombinedRates|null>
{
  // Sanitize our input
  const cleants = (!timestamp || timestamp > Date.now())
    ? Date.now()
    : timestamp;

  var coin = await getRates("Coin", cleants);
  var fx = await getRates("FxRates", cleants);

  if (!coin || !fx)
    return null;

  return {
    buy: coin.buy,
    sell: coin.sell,
    fxRate: fx[CurrencyCode.CAD],
    target: CurrencyCode.CAD,
    ...fx,
    validTill: Math.min(coin.validTill, fx.validTill),
    validFrom: Math.max(coin.validFrom, fx.validFrom),
  };
}

export function getLatestCombinedRates() : CombinedRates {
  var coin = getLatest("Coin") as CoinRate;
  var fx  = getLatest("FxRates") as FxRates;

  return {
    buy: coin.buy,
    sell: coin.sell,
    fxRate: fx[CurrencyCode.CAD],
    target: CurrencyCode.CAD,
    ...fx,
    validTill: Math.min(coin.validTill, fx.validTill),
    validFrom: Math.max(coin.validFrom, fx.validFrom),
  };
}

//
// Get the minimal set of rates covering the times listed in ts
export async function getManyRates(ts: number[]) : Promise<CombinedRates[]> {

  const r = [] as CombinedRates[];
  if (ts.length == 0)
    return r;

  // We don't want to fetch duplicates, so lets ensure we return a minimal amount
  const sorted = ts.sort();
  // Only process timestamp requests here: skip 0 and below
  let lastExpired = 1;
  for (const ts of sorted)
  {
    lastExpired = await maybeInsert(ts, lastExpired, r);
  }
  // If we have requested latest (0), then now add it now.  This is because our
  // prior iteration relies on each ts increasing, and our sorting breaks that;
  if (sorted[0] <= 0) {
    await maybeInsert(Date.now(), lastExpired, r);
  }


  return r;
}

async function maybeInsert(ts: number, lastExpired: number, rates: CombinedRates[]) {
  if (ts >= lastExpired) {
    try {
      const rate = await getCombinedRates(ts);
      if (rate) {
        rates.push(rate);
        return rate.validTill;
      }
    }
    catch (e: any) {
      log.error(e, "Error fetching {Timestamp}", ts);
    }
  }
  return lastExpired;
}
