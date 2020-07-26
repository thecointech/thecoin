//
// All the functions related to managing
// our local cache of "Latest" rates
//

import { CoinRate, FxRates, RateKey, RateType } from "./types";
import { CurrencyCode } from "@the-coin/utilities/CurrencyCodes";
import { getLatestStored } from "./db";
import { DateTime } from "luxon";

//
// A cached list of all supported exchanges.
//
const latest = {
  // Initialize with an empty rate (this will never be seen)
  Coin: {
    buy: 0, sell: 0,
    validFrom: 0,
    validTill: 0,
  } as CoinRate, // Explicitly label so typescript knows the type when accessing this directly

  FxRates: {
    validFrom: 0,
    validTill: 0,
  } as any as FxRates,
}

// explicitly initialize our supported rates
latest.FxRates[CurrencyCode.CAD] = 0;

export const updateLatest = (key: RateKey, newRate: RateType) =>
  checkValidity(key, newRate) &&
  setNewLatest(key, newRate)

export const getLatest = (key: RateKey) => latest[key];
export const getLatestCoin = () => getLatest("Coin") as CoinRate;
export const getLatestFx = () => getLatest("FxRates") as FxRates;

///////////////////////////////////////////////////////////////////////////

function setNewLatest(key: RateKey, newRate: RateType)
{
    // Update our latest rates as soon as they are valid;
    var waitingPeriod = newRate.validFrom - Date.now();
    // Only set timeout if we have enough time to wait
    // This is to ensure our switch happens quickly enough,
    // and we do not introduce an unneccessary delay
    if (waitingPeriod > 2)
      setTimeout(() => completeSetLatest(key, newRate), waitingPeriod);
    else
      completeSetLatest(key, newRate);

    return true;
}

function completeSetLatest(key: RateKey, newRate: RateType) {
  console.log("Updating {FxKey} latest cache at {Now}, new expiration: {ValidTill}",
    key, new Date(), newRate.validTill);

  latest[key] = newRate as any;
}

function checkValidity(key: RateKey, newRate: RateType)
{
  const current = latest[key];

  if (newRate.validTill < current.validTill) {
    // Our new rate is no more valid than the current one: bail
    console.error('New rate being set for {FxKey} with validUntil: new {ValidUntil} < current {ValidUntil}',
      key, DateTime.fromMillis(newRate.validTill), DateTime.fromMillis(current.validTill));
    return false;
  }
  else if (newRate.validFrom < current.validTill) {
    console.error('New rate being set for {FxKey} with validity overlap: new {ValidFrom} < current {ValidUntil}',
      key, DateTime.fromMillis(newRate.validFrom), DateTime.fromMillis(current.validTill));
    // In this case, we still increase our validity, so modify the incoming rate
    // to not overlap and continue
    newRate.validFrom = current.validTill;
  }
  else if (newRate.validFrom != current.validTill && current.validTill != 0) {
    console.error('New rate being set for {FxKey} with validity gap: new {ValidFrom} != current {ValidUntil}',
      key, DateTime.fromMillis(newRate.validFrom), DateTime.fromMillis(current.validTill));
    // In this case, we have updated too late and the previous rate expired
    // We do not modify the current rate, instead extend the previous rates
    // validity period to meet the new reates validUntil
    //current.validTill = current.validFrom;
    // We need to update DB with this valid
  }

  // Last sanity check, we didn't mess up the new rates validities with this call, did we?
  // We -must- be valid for at least 1 minute
  if (newRate.validTill - newRate.validFrom < 60000)
  {
    console.error('New rate being set for {FxKey} with no validity: {ValidFrom} >= {ValidUntil}',
      key, DateTime.fromMillis(newRate.validFrom), DateTime.fromMillis(newRate.validTill));
    return false;
  }

  // if we don't have at least 5 seconds before the new rate comes into effect, then warn
  // there isn't much we can do about this, but we should be tracking possible errors
  if (newRate.validFrom - Date.now() < 5000)
  {
    console.warn('New rate for {FxKey} takes effect too quickly: {ValidFrom} - now < 5s',
      key, DateTime.fromMillis(newRate.validTill))
  }
  return true;
}

// This should only get called one time, on system initialization
export const initLatest = async () => {
  latest.Coin = (await getLatestStored("Coin") ?? latest.Coin) as CoinRate;
  latest.FxRates = (await getLatestStored("Coin") ?? latest.FxRates) as FxRates;
}
