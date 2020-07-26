import { init, describe } from '@the-coin/utilities/firestore/jestutils';
import { setRate, getCoinRate, getRateDoc, cleanDb } from './db';
import { CoinRate } from "./types";
import { Timestamp } from '@the-coin/utilities/firestore';

describe("DB Connected Tests", () => {

  beforeEach(async () => {
    jest.setTimeout(10000);
    await init("broker-cad-db-basic");
    await cleanDb();
  })

  it('can insert rates', async function () {

    let dtnow = Timestamp.now();
    expect(dtnow.seconds).toBeGreaterThan(0);

    // We use a high value now to avoid colliding with the latest test below
    let now = 100000;
    // ------- Create a new rate (expire in 1.5 min) -------
    var rate = buildRate(now);
    await setRate("Coin", rate);

    // Was anything written?
    const doc = getRateDoc("Coin", now);
    const data = await doc.get();
    expect(data.exists).toBeTruthy();
    // const data = await doc.
    // const collection = getRate("Coin");
    // ------- Check if the new rate is here -------
    const fetched = await getCoinRate(now) as CoinRate;
    expect(fetched).toBeTruthy();
    expect(fetched.validFrom).toEqual(rate.validFrom);
    expect(fetched.validTill).toEqual(rate.validTill);
    expect(fetched.buy).toEqual(10);
  });

  it('should return searched rate', async function () {

    // Insert 5 rates, out of order
    var rates = [1000, 9000, 3000, 2000, 6000, 5000].map(buildRate);
    await Promise.all(rates.map(r => setRate("Coin", r)));

    var latest = await getCoinRate(9999);
    expect(latest).toBeTruthy();
    expect(latest?.validFrom).toEqual(9000);

    // If we search for a time that doesn't exist, it should fail
    var tooEarly = await getCoinRate(500);
    expect(tooEarly).toBeNull();
    var tooLate = await getCoinRate(11000);
    expect(tooLate).toBeNull();
    var noPresent = await getCoinRate(4500);
    expect(noPresent).toBeNull();

    // If we search for a valid rate, it should be there
    var validEntry = await getCoinRate(5500);
    expect(validEntry).toBeTruthy();
    expect(validEntry?.validFrom).toEqual(5000);

    // If we search a boundary entry, we should get the right version
    var onBoundary = await getCoinRate(2000);
    expect(onBoundary).toBeTruthy();
    expect(onBoundary?.validFrom).toEqual(2000);
    expect(onBoundary?.validTill).toEqual(3000);

    // If we search a boundary entry, we should get the right version
    var lastMs = await getCoinRate(3999);
    expect(lastMs).toBeTruthy();
    expect(lastMs?.validFrom).toEqual(3000);
    expect(lastMs?.validTill).toEqual(4000);
  })
})

const buildRate = (ts: number): CoinRate => ({
  buy: 10,
  sell: 10,
  validFrom: ts,
  validTill: ts + 1000,
})
