/* eslint-disable no-await-in-loop */
import { getFirestore, init } from '@thecointech/firestore';
import { DateTime, Duration } from 'luxon';
import { getCombinedRates } from '../internals/rates';
import { RateKey } from '../internals/rates/types';
import {
  copySeedDataToDb, getDataDir, seed,
} from './seed';

it('seeds the DB appropriately', async () => {
  await init({});
  const from = await seed();

  const db = getFirestore();
  const now = Date.now();
  const validityInterval = Duration.fromObject({ days: 1 });

  // Verify we have entry for all this history
  async function VerifyData(type: RateKey, numKeys: number) {
    let ts = from.toMillis();
    do {
      const entry = await db.collection(type).doc(ts.toString()).get();
      expect(entry.exists).toBeTruthy();
      ts += validityInterval.as('milliseconds');

      const data = entry.data();
      expect(data).toBeDefined();
      expect(Object.keys(data!).filter((k) => k !== '_converter').length).toBe(numKeys);
      expect(data!.validTill).toBeDefined();
      expect(data!.validFrom).toBeDefined();

      // Uncomment once fix merged into mocked DB
      // const data = entry.data() as any;
      // expect(data!.validTill.toMillis()).toEqual(ts);
    } while (ts < now);
  }

  await VerifyData('Coin', 4);
  await VerifyData('FxRates', 181);

  // This cannot be tested with the mocked DB.  Just step through it in debug mode.
  // How many entries do we get if run the script again.
  // const coinEntries = await db.collection("Coin").get();
  // const numEntries = coinEntries.docs.length;

  // // Run seed a second time (emulator has persistance)
  // await SeedWithRandomRates(from, validityInterval);
  // const coinEntries2 = await db.collection("Coin").get();
  // expect(coinEntries2.docs.length).toEqual(numEntries);
});

it('seeds the DB with valid rate data', async () => {
  await init({});
  const now = DateTime.now();
  const rates = Array.from({ length: 15 }).map((_, i) => ({
    rate: 15 - i,
    from: now.minus({ days: i + 1 }).toMillis(),
    to: now.minus({ days: i }).toMillis(),
  }));
  const till = await copySeedDataToDb(now.minus({ days: 15 }), Duration.fromObject({ days: 1 }), rates);
  expect(till.toMillis()).toEqual(now.toMillis());

  // For each day we should have something
  for (let i = 0; i < 15; i++) {
    const entry = (await getCombinedRates(now.minus({ days: 15 - i }).toMillis()))!;
    expect(entry).toBeDefined();
    expect(entry.fxRate).toBe(1);
    expect(entry.buy).toBe(i + 1);
    expect(entry.sell).toBe(i + 1);
  }
});

it('can find the data dir', () => {
  const dataDir = getDataDir();
  expect(dataDir.endsWith('data')).toBe(true);
});
