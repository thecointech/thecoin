import { RateKey, CombinedRates, RateType, CoinRate, FxRates } from "./types";
import { getLatest } from "./latest";
import { CurrencyCode } from "@the-coin/utilities/CurrencyCodes";
import { ensureLatestRate } from "./UpdateDb";
import { getRate } from "./db";
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

  // If our timestamp is out-of-range for whatever reason, attempt to force update
  if (latest.validTill <= timestamp) {
    console.warn("No currency retrieved for {FxKey} at {Timestamp}, attempting update",
      key, timestamp);
    return await ensureLatestRate(key, timestamp);
  }
  if (latest.validFrom <= timestamp)
    return latest;

  return await getRate(key, timestamp);
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

