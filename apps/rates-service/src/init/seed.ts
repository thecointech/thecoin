//----------------------------------------------------------------
// Seed our data base with random values.
// Used for dev:live.   If we are running on development,
// then seed our database with random values.

import { CurrencyCode } from "@thecointech/utilities/CurrencyCodes";
import { DateTime, Duration } from "luxon";
import { getLatestStored, setRate } from "../internals/rates/db";
import { CoinRate, FxRates } from "../internals/rates/types";
import { log } from "@thecointech/logging";

export async function seed() {
  log.trace('--- Seeding DB ---');
  // temp disable logging (todo: move into log library?)
  const oldLevels = log.levels();
  oldLevels.forEach((_lvl, idx) => log.levels(idx, 50));

  // Seed our DB for a year, values set for a day.
  const from = DateTime
    .local()
    .minus({ years: 1.1 })
    .set({
      hour: 9,
      minute: 31,
      second: 30,
      millisecond: 0
    });

  const validityInterval = Duration.fromObject({ days: 1 });
  await SeedWithRandomRates(from, validityInterval);

  // re-enable logging
  oldLevels.forEach((lvl, idx) => log.levels(idx, lvl));
  log.trace('Seeding complete');
}

export async function SeedWithRandomRates(from: DateTime, validityInterval: Duration) {

  const latest = await getLatestStored("Coin");
  const msValidityInterval = validityInterval.as("milliseconds");
  const now = Date.now();
  let rate = 1;
  for (
    let ts = latest?.validTill ?? from.toMillis();
    ts < now;
    ts += msValidityInterval)
  {
    const validity = {
      validFrom: ts,
      validTill: ts + msValidityInterval,
    }
    // Max variation per day is 1%
    rate = rate + Math.random() / 100;
    // Bias is 10 % up per year, over 365 days
    rate = rate + (0.1 / 365);
    // Minimum rate
    rate = Math.max(rate, 0.5);
    const coin: CoinRate = {
      buy: rate - 0.001,
      sell: rate,
      ...validity,
    }

    const fxRate = {
      ...RandomFxRates(),
      ...validity,
    } as FxRates;
    await setRate("Coin", coin);
    await setRate("FxRates", fxRate);
  }
}

const RandomFxRates = () =>
  Object
    .keys(CurrencyCode)
    .filter(k => /^\d+$/.test(k))
    .filter(k => k !== '0')
    .map(key => [key, RandomFxRate()])
    .reduce((acc, [key, value]) => ({...acc, [key]: value}), {});

const RandomFxRate = () => 0.9 + (Math.random() / 10)
