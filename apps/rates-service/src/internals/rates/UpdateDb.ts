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
import { log } from '@thecointech/logging';
import { updateOracle } from '../oracle';
import { toDateStr } from '../../utils/date';

/////////////////////////////////////////////////////////////////////////////////
//
// Logs important info, and returns true if we should update.
function isUpdateRequired(key: RateKey, now: number, current: RateType) {
  log.debug(
    { FxKey: key, now: toDateStr(now), ValidUntil: toDateStr(current.validTill), },
    "Updating {FxKey} at {now} with current expiration {ValidUntil}",
  );

  // Quick exit if we are updating again too quickly
  // We should only update in the period between
  // when the new market values become available
  // and when they become our new rates.
  const remainingValidity = current.validTill - now;
  if (remainingValidity > RateOffsetFromMarket)
  {
    log.debug(
      { FxKey: key, Remaining: remainingValidity },
      "Existing {FxKey} has remaining validity {Remaining}ms, no update required"
    );
    return false;
  }
  return true;
}

//
// Fetch all intervening rates from latest to now,
// set to DB and update our latest rate
export async function ensureLatestCoinRate(now: number)
{
  const key = "Coin";
  const current = getLatest(key);
  if (!isUpdateRequired(key, now, current))
    return true;

  // fetch any new rates from then till now
  const newRates = await fetchCoinRate(current.validTill, now);
  if (!newRates.length) {
    log.warn({ FxKey: key }, "{FxKey} required update, but no new rates were found");
    return false;
  }
  // If we are updating on time, we should only have a single rate to insert
  if (newRates.length > 1)
  {
    log.warn(
      { FxKey: key, ValidFrom: toDateStr(current.validFrom), ValidTill: toDateStr(current.validTill) },
      "Multiple inserts found for {FxKey} from {ValidFrom} to {ValidTill}"
    );
  }

  // Insert to DB
  for (const rate of newRates)
    await setRate(key, rate);

  // Update our cache of latest rate
  updateLatest(key, newRates.pop()!)
  log.debug({ FxKey: key }, "Finished update for {FxKey}");
  return true;
}

//
// Fetch current Fx rate, and set it is the new rate
// We ignore holes, however, if the previous rate has
// expired we update it's validity to extend until now
export async function ensureLatestFxRate(now: number) {
  const key = "FxRates";
  const current = getLatest(key);
  if (!isUpdateRequired(key, now, current))
    return true;

  // fetch any new rates from then till now
  const fxRates = await fetchFxRate(current.validTill, now);
  if (!fxRates) {
    log.warn({ FxKey: key }, "{FxKey} required update, but no new rates were found");
    return false;
  }

  log.info(
    { FxKey: key, LastValid: toDateStr(current.validFrom), NextValid: toDateStr(current.validTill) },
    "Updating {FxKey} from {LastValid} to {NextValid}"
  );

  if (current.validTill < fxRates.validFrom)
  {
    // We have a hole in our validity,
    // update the latest to extend it's validity
    // until now.
    log.warn("This should never happen");
    current.validTill = fxRates.validFrom;
  }
  // Insert to DB
  await setRate(key, fxRates);

  // Update our cache of latest rate
  updateLatest(key, fxRates)
  log.debug({ FxKey: key }, "Finished update for {FxKey}");
  return true;
}


export async function update() {
  const now = Date.now();

  try {
    // Either of the below functions could throw.  We
    // don't check them individually
    // because our entry point implements
    // backoff/retry logic.  If the ensure
    // is called again it won't matter because it's already
    // up to date.
    const r = await Promise.allSettled([
      ensureLatestCoinRate(now),
      ensureLatestFxRate(now),
    ]);
    if (r.some(r => r.status === "rejected")) {
      return false;
    }
  } catch (err: any) {
    log.warn(err, 'error in EnsureLatest');
    return false;
  }

  try {
    // Once we have updated, do a matching update on Oracle
    await updateOracle(now);
    return true;
  } catch (err: any) {
    log.warn(err, 'error in UpdateOracle');
    return false;
  }
}

export async function updateRates() {
  for (let i = 0; i < 5; i++) {
    // incremental back-off
    // TO FIX: This conflates two waits,
    // waiting for values to valid, and back-off-retry
    await waitTillBuffer(i * 5000);
    // & retry
    if(await update())
      return true;
  }
  log.fatal("Failed to update rates");
  return false;
}

