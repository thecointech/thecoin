
import { update, ensureLatestCoinRate, ensureLatestFxRate } from "./UpdateDb";
import { NextOpenTimestamp } from "@the-coin/utilities/MarketStatus";
import { validFor } from "@the-coin/utilities/FxRates";
import { describe, init } from "@the-coin/utilities/firestore/jestutils";
import { RateOffsetFromMarket, CoinRate, CoinUpdateInterval } from "./types";
import { updateLatest, getLatest } from "./latest";
import { cleanDb, getLatestStored, getRate } from "./db";

describe("Inserts all necessary coin rates", () => {

  beforeEach(async () => {
    jest.setTimeout(30000);
  })

  it('can update Coin rates', async () => {
    await init("broker-cad-update-coin");
    await cleanDb();

    var now = Date.now();
    const startValidity = await initCoinLatest(now);

    // this should throw errors because it will update multiple
    // so we change the console warn/error fn's to keep output clean
    console.warn = jest.fn();
    console.error = jest.fn();
    await ensureLatestCoinRate(now);
    //expect(console.warn).toBeCalled();
    //expect(console.error).toBeCalled();

    // Do we have latest cache updated?
    // There should have been something returned
    var latestStored = await getLatestStored("Coin");
    expect(latestStored).toBeTruthy();
    expect(latestStored!.validTill).toBeGreaterThan(now);

    // Did we store valid rates for the entire period
    for (let ts = now; ts > startValidity; ts -= CoinUpdateInterval) {
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
    await init("broker-cad-update-fx");
    await cleanDb();

    var now = Date.now();
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
    await init("broker-cad-update");
    await cleanDb();

    await initCoinLatest(Date.now());
    // this should throw errors because it will update multiple
    // so we change the console warn/error fn's to keep output clean
    console.warn = jest.fn();
    console.error = jest.fn();
    var didUpdate = await update();
    expect(didUpdate).toBeTruthy();
  });
})

async function initCoinLatest(now: number)
{
      // We need to start with an appropriate validity.  Lets capture at least 1 days input
    // Search backwards to find an appropriate starting point
    let startValidity = now;
    for (let i = 1; i < 5 && startValidity >= now; i++) {
      startValidity = await NextOpenTimestamp(new Date(now - (i * 24 * 60 * 60 * 1000)), 60000 + RateOffsetFromMarket);
    }
    // Fake an initial ts.  This is because the system assumes that there is an initial
    // value (will error if none is found)
    updateLatest("Coin", {
      validTill: startValidity
    } as any as CoinRate);

    return startValidity;
}
// it('should return ms to wait to reach (seconds past the minute)', function () {
// 	let now = new Date(1539739800123);
// 	let toWait = GetMsTillSecsPast(2, now);
// 	let fin = now.getSeconds() * 1000 + now.getMilliseconds() + toWait;
// 	expect(fin).toEqual(2000);

// 	now = new Date(1539739835123);
// 	toWait = GetMsTillSecsPast(30, now);
// 	fin = now.getSeconds() * 1000 + now.getMilliseconds() + toWait;

// 	expect(toWait).toEqual(0); // "Waited when it should not have");
// });
