// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine

import { updateLatest, getLatest } from "./latest";
import { setRate } from "./db";
import { fetchCoinRate } from "./fetchCoin";
import { fetchFxRate } from "./fetchFx";
import { RateKey, RateOffsetFromMarket, RateType } from "./types";
import { waitTillBuffer } from "./delay";

/////////////////////////////////////////////////////////////////////////////////

const fetchNewRate = (key: RateKey, now: number, currentExpires: number) =>
  (key == "Coin")
    ? fetchCoinRate(currentExpires, now)
    : fetchFxRate(currentExpires, now)

export async function ensureLatestRate(key: RateKey, now: number) : Promise<RateType>
{
  let current = getLatest(key);
  console.log("Updating {FxKey} with current expiration {ValidUntil}",
    key, current.validTill);

  // Quick exit if we are updating again too quickly
  // We should only update in the period between
  // when the new market values become available
  // and when they become our new rates.
  const remainingValidity = current.validTill - now;
  if (remainingValidity > RateOffsetFromMarket)
  {
    console.log("Existing {FxKey} has remaining validity {Remaining}, exiting",
      key, remainingValidity);
    return current;
  }

  // If no previous validity, we have no existing validities and history starts now
  const currentValidUntil = current.validTill || now;
  // fetch our new rate
  // TODO: We need to compensate if we have missed some updates.  We can't have
  // holes in our validity.
  const newRate = await fetchNewRate(key, now, currentValidUntil);
  console.log("Fetched new rates for {FxKey} with new expiration {ValidUntil}",
    key, newRate?.validTill);

  // Does the new rate meaningfully update our existing latest rate?
  if (!newRate || !updateLatest(key, newRate))
    return current;

  // If so, then store to DB
  await setRate(key, newRate);
  return newRate;
}

export async function update() {
    try {
      const now = Date.now();
      const coinWait = ensureLatestRate("Coin", now);
      const fxWait = ensureLatestRate("FxRates", now);

      const coinResult = await coinWait;
      const fxResult = await fxWait;

      const minValidity = Math.min(coinResult.validTill, fxResult.validTill);
      return minValidity > now;
    }
    catch (err) {
        console.error(err);
    }
    return false;
}

export async function updateRates() {
  for (let i = 0; i < 5; i++) {
    // incremental back-off
    await waitTillBuffer(i * 5000);
    // & retry
    if(await update())
      return true;
  }
  return false;
}

