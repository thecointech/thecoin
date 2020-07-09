import { initLatest, getLatest } from "./latest"
import { setRate } from "./db";
import { CoinRate, FxRates } from "./types";
import { init, describe } from "@the-coin/utilities/firestore/jestutils";

describe('we connect', () => {

  it('should initialize correctly', async () => {

    await init("broker-cad");
    // Insert 5 rates, out of order
    const validTimes = [1000, 9000, 3000, 2000, 6000, 5000];
    var coinRates = validTimes.map(buildCoinRate);
    var fxRates = validTimes.map(buildFxRate);
    await Promise.all(coinRates.map(r => setRate("Coin", r)));
    await Promise.all(fxRates.map(r => setRate("FxRates", r)));
    await initLatest();

    const coin = getLatest("Coin");
    const fx = getLatest("FxRates");
    expect(coin).toBeTruthy()
    expect(fx).toBeTruthy()
    const mostRecent = Math.max(...validTimes);
    expect(coin.validFrom).toEqual(mostRecent)
    expect(fx.validFrom).toEqual(mostRecent)
  })
})


const buildCoinRate = (ts: number): CoinRate => ({
  buy: 10,
  sell: 10,
  validFrom: ts,
  validTill: ts + 1000
})

const buildFxRate = (ts: number): FxRates => ({
  validFrom: ts,
  validTill: ts + 1000,
  124: 1.5
} as any)
