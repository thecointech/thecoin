
import { update, ensureLatestCoinRate, ensureLatestFxRate } from "./UpdateDb";
import { validFor } from "@thecointech/utilities/FxRates";
import { init } from "@thecointech/firestore";
import { CoinRate, CoinUpdateInterval } from "./types";
import { updateLatest, getLatest } from "./latest";
import { getLatestStored, getRate } from "./db";

jest.mock('../FinnHub');

// Start 5 mins into the mocked data
var now = 1593696900000;
const sixHrs = 6 * 60 * 60 * 1000;

beforeEach(async () => {
  jest.setTimeout(30000);
})

it('can update Coin rates', async () => {
  await init({});
  await initCoinLatest(now);

  // Update rates for 6 hours.
  // this should log errors because it will update multiple
  // so we change the console warn/error fn's to keep output clean
  console.warn = jest.fn();
  console.error = jest.fn();
  await ensureLatestCoinRate(now + sixHrs);
  //expect(console.warn).toBeCalled();
  //expect(console.error).toBeCalled();

  // Do we have latest cache updated?
  // There should have been something returned
  var latestStored = await getLatestStored("Coin");
  expect(latestStored).toBeTruthy();
  expect(latestStored!.validTill).toBeGreaterThan(now);

  // Did we store valid rates for the entire period
  for (let ts = now; ts > now; ts -= CoinUpdateInterval) {
    var rate = await getRate("Coin", ts);
    expect(rate).toBeTruthy();
    expect(validFor(rate!, ts)).toBeTruthy();
  }

  // Did we update latest cache?
  const latest = getLatest("Coin");
  expect(latest).toBeDefined();
  expect(latest.validTill).toBeGreaterThan(now);
})

it("inserts FxRates correctly", async () => {
  await init({});
  await ensureLatestFxRate(now);

  // There should have been something returned
  var latestStored = await getLatestStored("FxRates");
  expect(latestStored).toBeTruthy();
  expect(latestStored!.validFrom).toEqual(0);
  expect(latestStored!.validTill).toBeGreaterThan(now);

  // Did we update latest cache?
  const latest = getLatest("FxRates");
  expect(latest).toEqual(latestStored);
});

it('should return a valid rate', async () => {
  await init({});

  // Mock date.now
  Date.now = jest.fn(() => now + sixHrs)

  await initCoinLatest(now);
  // this should throw errors because it will update multiple
  // so we change the console warn/error fn's to keep output clean
  console.warn = jest.fn();
  console.error = jest.fn();
  var didUpdate = await update();
  expect(didUpdate).toBeTruthy();
});


async function initCoinLatest(now: number) {
  // Fake an initial ts.  This is because the system assumes that there is an initial
  // value (will error if none is found)
  updateLatest("Coin", {
    validTill: now
  } as any as CoinRate);
}
