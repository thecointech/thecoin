
import { CoinRate, FXRate } from "./types";
import { updateLatest } from "./latest";
import { getCombinedRates } from '.';
import { log } from '@thecointech/logging';

it('can get combined rates', async () => {
  // disable logging
  log.level(100);
  const startMs = Date.now();
  await initLatest(startMs);

  const r = await getCombinedRates();

  expect(r).toBeTruthy();
  expect(r?.validFrom).toBeTruthy();
  expect(r?.validTill).toBeTruthy();
  expect(r?.[124]).toBeTruthy();
});

async function initLatest(startMs: number) {
  // Fake an initial ts.  This is because the system assumes that there is an initial
  // value (will error if none is found)
  const validFrom = startMs - 1000;
  const validTill = startMs + 1000 * 60 * 60 * 24;
  updateLatest("Coin", {
    validFrom,
    validTill,
    buy: 1,
    sell: 1,
  } as CoinRate);
  updateLatest("FxRates", {
    validFrom,
    validTill,
    124: 1,
  } as FXRate);
}
