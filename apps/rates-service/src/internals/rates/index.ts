import { RateKey, CombinedRates, RateType, CoinRate, FxRates } from "./types";
import { getLatest } from "./latest";
import { CurrencyCode } from "@the-coin/utilities/CurrencyCodes";
import { validFor } from "@the-coin/utilities/FxRates";
import { getRate } from "./db";
import { update } from "./UpdateDb";
export { updateRates } from './UpdateDb'

//
// entry point for anything external to the rates folder
//

async function getRates(key: RateKey, timestamp: number) : Promise<RateType|null> {
  console.log("getting rates for %d at %s", key, timestamp);

  // We don't support future times
  if (timestamp > Date.now())
    return null;

  // Double check this is not for the future
  let latest = getLatest(key);

  // If latest matches, return it
  if (validFor(latest, timestamp)) {
    return latest;
  }

  // get from DB
  let rate = await getRate(key, timestamp);
  if (rate != null)
    return rate;

  // Finally, if something has gone really wrong with our updates, try forcing it.
  // This shouldn't happen, it is most likely an error condition.
  console.warn("Could not find {FxKey} for {Timestamp}, forcing update",
    key, timestamp);

  if (await update())
    return await getRate(key, timestamp);
  // Nothing doing, return null
  return null;
}

export async function getCombinedRates(timestamp: number) : Promise<CombinedRates|null>
{
  const coinWait = getRates("Coin", timestamp);
  const fxWait = getRates("FxRates", timestamp);
  var [coin, fx] = await Promise.all([coinWait, fxWait]) as [CoinRate|null, FxRates|null];

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

