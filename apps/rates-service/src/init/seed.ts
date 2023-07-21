/* eslint-disable no-await-in-loop */
//----------------------------------------------------------------
// Seed our data base with random values.
// Used for dev:live.   If we are running on development,
// then seed our database with random values.

import { CurrencyCode } from '@thecointech/fx-rates';
import { DateTime, Duration } from 'luxon';
import { log } from '@thecointech/logging';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLatestStored, setRate } from '../internals/rates/db';
import { CoinRate, FxRates } from '../internals/rates/types';
import { update } from '../internals/rates/UpdateDb';
import { getLatest, updateLatest } from '../internals/rates/latest';

export async function seed() {
  log.trace('--- Seeding DB ---');
  // temp disable logging (todo: move into log library?)
  const oldLevels = log.levels();
  oldLevels.forEach((_lvl, idx) => log.levels(idx, 50));

  // Seed our DB for a year, values set for a day.
  const from = DateTime
    .local()
    .minus({ years: 1 })
    .set({
      hour: 9,
      minute: 31,
      second: 30,
      millisecond: 0,
    });
  const validityInterval = Duration.fromObject({ days: 1 });

  // Always seed with live rates (falls back to random)
  await seedRates(from, validityInterval);

  // re-enable logging
  oldLevels.forEach((lvl, idx) => log.levels(idx, lvl));

  // Triggering an update ensures the oracle is updated
  // before we re-enable logging
  await update();

  log.trace(`Seeding complete from ${from.toLocaleString(DateTime.DATETIME_MED)}`);

  return from;
}

async function seedRates(from: DateTime, validityInterval: Duration) {
  // Load live rates
  log.debug(`Seeding Historical rates from ${from.toSQLDate()}`);
  const rates = readLiveSeedRates();
  const till = await copySeedDataToDb(from, validityInterval, rates);
  // Fill up on random rates
  await seedWithRandomRates(till, validityInterval, 0);
}

export function getDataDir() {
  let folder = fileURLToPath(import.meta.url);
  while (path.basename(folder) !== 'apps') {
    folder = path.dirname(folder);
  }
  return path.resolve(folder, '../data');
}

type LiveRate = {
  from: number,
  to: number,
  rate: number,
}
export function readLiveSeedRates() : LiveRate[]|null {
  const file = path.join(getDataDir(), 'rates.json');
  if (existsSync(file)) {
    const fileRaw = readFileSync(file, 'utf8');
    const fileJson = JSON.parse(fileRaw);
    const { rates } = fileJson;
    return rates;
  }
  return null;
}

async function setRateForTime(from: DateTime, validityInterval: Duration, rates: LiveRate[]) {
  const rate = rates.find((r) => r.from <= from.toMillis() && r.to > from.toMillis());
  if (!rate) {
    return false;
  }
  const to = from.plus(validityInterval);
  const validity = {
    validFrom: from.toMillis(),
    validTill: to.toMillis(),
  };
  const coin = {
    buy: rate.rate,
    sell: rate.rate,
    ...validity,
  };
  const fxRate = {
    [CurrencyCode.CAD]: 1,
    ...validity,
  } as FxRates;
  await setRate('Coin', coin);
  await setRate('FxRates', fxRate);

  updateLatest('Coin', coin);
  updateLatest('FxRates', fxRate);
  return to;
}

export async function copySeedDataToDb(from: DateTime, validityInterval: Duration, rates: LiveRate[]|null) {
  let validFrom = from;
  try {
    if (rates) {
      while (validFrom < DateTime.now()) {
        const validTo = await setRateForTime(validFrom, validityInterval, rates);
        if (!validTo) break;
        validFrom = validTo;
      }
    }
  } catch (e: any) {
    // No-op
    log.debug(e.message);
  }
  return validFrom;
}

export async function seedWithRandomRates(from: DateTime, validityInterval: Duration, fxSpread = 0.1) {
  log.debug(`Seeding Random rates from ${from.toSQLDate()}`);
  // Check cache in case we have seeded historical data already.
  // This is because dev cannot order by, so getLatestStored returns
  // the wrong value.  On dev, it doesn't matter because we either
  // have historical data, or we have nothing on start (because in memory).
  // On devlive, we either have historical, or the 'latest' query works
  const latest = getLatest('Coin') ?? await getLatestStored('Coin');
  const msValidityInterval = validityInterval.as('milliseconds');
  const now = Date.now();
  let rate = latest?.buy ?? 1;
  for (
    let ts = latest?.validTill ?? from.toMillis();
    ts < now;
    ts += msValidityInterval) {
    const validity = {
      validFrom: ts,
      validTill: ts + msValidityInterval,
    };
    // Max variation per day is 1%
    rate += Math.random() / 100;
    // Bias is 10 % up per year, over 365 days
    rate += (0.1 / 365);
    // Minimum rate
    rate = Math.max(rate, 0.5);
    const coin: CoinRate = {
      buy: rate,
      sell: rate,
      ...validity,
    };

    const fxRate = {
      ...RandomFxRates(fxSpread),
      ...validity,
    } as FxRates;
    await setRate('Coin', coin);
    await setRate('FxRates', fxRate);

    updateLatest('Coin', coin);
    updateLatest('FxRates', fxRate);
  }
}

const RandomFxRates = (fxSpread: number) => Object
  .keys(CurrencyCode)
  .filter((k) => /^\d+$/.test(k))
  .filter((k) => k !== '0')
  .map((key) => [key, RandomFxRate(fxSpread)])
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

const RandomFxRate = (fxSpread: number) => (1 - (fxSpread / 2)) + (Math.random() * fxSpread);
