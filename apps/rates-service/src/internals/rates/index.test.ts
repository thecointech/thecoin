
import { jest } from '@jest/globals';
import { init } from "@thecointech/firestore";
import { CoinRate } from "./types";
import { updateLatest } from "./latest";
import { getCombinedRates } from '.';
import { log } from '@thecointech/logging';

// Start 5 mins into the mocked data
var mockStart = 1593696900000;
const sixHrs = 6 * 60 * 60 * 1000;

jest
  .useFakeTimers()
  .setSystemTime(mockStart + sixHrs);

it('can get combined rates', async () => {
  // disable logging
  log.level(100);
  await init({});
  await initCoinLatest(mockStart);

  const r = await getCombinedRates();

  expect(r).toBeTruthy();
  expect(r?.validFrom).toBeTruthy();
  expect(r?.validTill).toBeTruthy();
  expect(r?.[124]).toBeTruthy();
});

async function initCoinLatest(now: number) {
  // Fake an initial ts.  This is because the system assumes that there is an initial
  // value (will error if none is found)
  updateLatest("Coin", {
    validTill: now
  } as any as CoinRate);
}
