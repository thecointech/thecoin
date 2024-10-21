//
// All the functions related to managing
// our local cache of "Latest" rates
//

import { CurrencyCode } from '@thecointech/fx-rates';
import { DateTime } from 'luxon';
import { log } from '@thecointech/logging';
import { getLatestStored } from './db';
import {
  CoinRate, FxRates, RateKey, RateType,
} from './types';
import { toDateStr } from '../../utils/date';
//
// A cached list of all supported exchanges.
//
const zeroCoin: CoinRate = {
  buy: 0,
  sell: 0,
  validFrom: 0,
  validTill: 0,
}
const zeroFx: FxRates = {
  validFrom: 0,
  validTill: 0,
  [CurrencyCode.CAD]: 0
} as any;

const latest = {
  // Initialize with an empty rate (this will never be seen)
  Coin: zeroCoin, // Explicitly label so typescript knows the type when accessing this directly
  FxRates: zeroFx,
};

export const updateLatest = (key: RateKey, newRate: RateType) => checkValidity(key, newRate)
  && setNewLatest(key, newRate);

export const getLatest = <T extends RateKey>(key: T) => latest[key];
export const getLatestCoin = () => getLatest('Coin') as CoinRate;
export const getLatestFx = () => getLatest('FxRates') as FxRates;

/// ////////////////////////////////////////////////////////////////////////

function setNewLatest(key: RateKey, newRate: RateType) {
  // Update our latest rates as soon as they are valid;
  const waitingPeriod = newRate.validFrom - Date.now();
  // Only set timeout if we have enough time to wait
  // This is to ensure our switch happens quickly enough,
  // and we do not introduce an unneccessary delay
  if (waitingPeriod > 2) {
    setTimeout(() => completeSetLatest(key, newRate), waitingPeriod);
  } else {
    completeSetLatest(key, newRate);
  }

  return true;
}

function completeSetLatest(key: RateKey, newRate: RateType) {
  log.debug(
    { FxKey: key, Now: toDateStr(DateTime.now()), ValidTill: toDateStr(newRate.validTill) },
    'Updating {FxKey} latest cache at {Now}, new expiration: {ValidTill}');

  latest[key] = newRate as any;
}

function checkValidity(key: RateKey, newRate: RateType) {
  const current = latest[key];

  if (newRate.validTill < current.validTill) {
    // Our new rate is no more valid than the current one: bail
    log.error(
      { FxKey: key, CurrentTill: toDateStr(current.validTill), NewTill: toDateStr(newRate.validTill) },
      'New rate being set for {FxKey} with validUntil: new {NewTill} < current {CurrentTill}');
    return false;
  }
  if (newRate.validFrom < current.validTill) {
    log.error(
      { FxKey: key, CurrentTill: toDateStr(current.validTill), NewFrom: toDateStr(newRate.validFrom) },
      'New rate being set for {FxKey} with validity overlap: new {NewFrom} < current {CurrentTill}',
    );
    // In this case, we still increase our validity, so modify the incoming rate
    // to not overlap and continue
    newRate.validFrom = current.validTill;
  } else if (newRate.validFrom != current.validTill && current.validTill != 0) {
    log.error(
      { FxKey: key, CurrentTill: toDateStr(current.validTill), NewFrom: toDateStr(newRate.validFrom) },
      'New rate being set for {FxKey} with validity gap: new {NewFrom} != current {CurrentTill}'
    );
    // In this case, we have updated too late and the previous rate expired
    // We do not modify the current rate, instead extend the previous rates
    // validity period to meet the new reates validUntil
    // current.validTill = current.validFrom;
    // We need to update DB with this valid
  }

  // Last sanity check, we didn't mess up the new rates validities with this call, did we?
  // We -must- be valid for at least 1 minute
  if (newRate.validTill - newRate.validFrom < 60000) {
    log.error(
      { FxKey: key, NewFrom: toDateStr(newRate.validFrom), NewTill: toDateStr(newRate.validTill) },
      'New rate being set for {FxKey} with no validity: {NewFrom} >= {NewTill}'
    );
    return false;
  }

  // if we don't have at least 5 seconds before the new rate comes into effect, then warn
  // there isn't much we can do about this, but we should be tracking possible errors
  // This is not currently an issue, but I'll leave it here as a reminder
  // const now = Date.now();
  // if (newRate.validFrom - now < 5000) {
  //   log.warn(
  //     { FxKey: key, now: toDateStr(now), NewTill: toDateStr(newRate.validTill) },
  //     `New rate {FxKey} comes into force without sufficient time to allow updates to propagate: {NewTill} - {now} < 5s`
  //   );
  // }
  return true;
}

// This should only get called one time, on system initialization
export const initLatest = async () => {
  latest.Coin = (await getLatestStored('Coin') ?? latest.Coin) as CoinRate;
  latest.FxRates = (await getLatestStored('FxRates') ?? latest.FxRates) as FxRates;
};

// Used by testing to reset in between tests
export const clearLatest = () => {
  latest.Coin = zeroCoin;
  latest.FxRates = zeroFx;
};
