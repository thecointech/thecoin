// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GOOGLE_CLOUD_PROJECT environment variable. See
// https://github.com/GoogleCloudPlatform/google-cloud-node/blob/master/docs/authentication.md
// These environment variables are set automatically on Google App Engine

import { getLatest, updateLatest } from "./latest";
import { setRate } from "./db";
import { fetchCoinRate } from "./fetchCoin";
import { RateKey, RateOffsetFromMarket, RateType } from "./types";
import { waitTillBuffer } from "./delay";
import { fetchFxRate } from "./fetchFx";

/////////////////////////////////////////////////////////////////////////////////

//
// Logs important info, and returns true if we should update.
function isUpdateRequired(key: RateKey, now: number, current: RateType) {
  console.log("Updating {FxKey} with current expiration {ValidUntil}",
    key, current.validTill);

  // Quick exit if we are updating again too quickly
  // We should only update in the period between
  // when the new market values become available
  // and when they become our new rates.
  const remainingValidity = current.validTill - now;
  if (remainingValidity > RateOffsetFromMarket)
  {
    console.log("Existing {FxKey} has remaining validity {Remaining}, no update required",
      key, remainingValidity);
    return false;
  }
  return true;
}

function validateNewRate(key: RateKey, validator:any)
{
    // Does the new rate meaningfully update our existing latest rate?
    if (!validator)
    {
      // We require an update, but have no new data.
      // What should we do here?
      console.error("{FxKey} required update, but no new rates were found", key);
      throw new Error('NoUpdatesFetched');
    }
}

//
// Fetch all intervening rates from latest to now,
// set to DB and update our latest rate
export async function ensureLatestCoinRate(now: number)
{
  const key = "Coin";
  const current = getLatest(key);
  if (!isUpdateRequired(key, now, current))
    return;

  // fetch any new rates from then till now
  const newRates = await fetchCoinRate(current.validTill, now);
  validateNewRate(key, newRates.length);
  // If we are updating on time, we should only have a single rate to insert
  if (newRates.length > 1)
  {
    console.warn("Multiple inserts found for {FxKey} from {ValidFrom} to {ValidTill}",
      key, current.validFrom, now);
  }

  // Insert to DB
  for (const rate of newRates)
    await setRate(key, rate);

  // Update our cache of latest rate
  updateLatest(key, newRates.pop()!)
  console.log("Finished update for {FxKey}", key);
}

//
// Fetch current Fx rate, and set it is the new rate
// We ignore holes, however, if the previous rate has
// expired we update it's validity to extend until now
export async function ensureLatestFxRate(now: number) {
  const key = "FxRates";
  const current = getLatest(key);
  if (!isUpdateRequired(key, now, current))
    return;

  // fetch any new rates from then till now
  const fxRates = await fetchFxRate(current.validTill, now);
  validateNewRate(key, fxRates);

  if (current.validTill < fxRates.validFrom)
  {
    // We have a hole in our validity,
    // update the latest to extend it's validity
    // until now.
    current.validTill = fxRates.validFrom;
    await setRate("FxRates", current);
  }
  // Insert to DB
  await setRate(key, fxRates);

  // Update our cache of latest rate
  updateLatest(key, fxRates)
  console.log("Finished update for {FxKey}", key);
}


export async function update() {
    try {
      const now = Date.now();
      // Either of the below functions could throw.  We
      // don't check them individually
      // because our entry point implements
      // backoff/retry logic.  If the ensure
      // is called again it won't matter because it's already
      // up to date.
      const coinWait = ensureLatestCoinRate(now);
      const fxWait = ensureLatestFxRate(now);

      await coinWait;
      await fxWait;
      return true;
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

