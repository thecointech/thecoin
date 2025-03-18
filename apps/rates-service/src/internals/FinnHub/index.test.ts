import { jest } from '@jest/globals';
import { fetchNewCoinRates, fetchNewFxRates } from "./index";
import { describe, ifSecret } from '@thecointech/jestutils'

beforeAll(async () => {
  jest.setTimeout(60000);
})

const ThreeDay = 3 * 24 * 60 * 60 * 1000;

it('can fetch coin rates', async () => {
  const ts = Date.now();
  const data = await fetchNewCoinRates("1", ts - ThreeDay, ts);
  expect(data.s).toEqual("ok");
})

it('can fetch fx rates', async () => {
  const data = await fetchNewFxRates();
  // Lets ensure that we have normalized to USD
  expect(data.base).toEqual("USD");
  expect(data.quote.USD).toBe(1);
  // Let make our currencies of interest exist
  expect(data.quote.CAD).toBeGreaterThan(0);
  expect(data.quote.NZD).toBeGreaterThan(0);
  expect(data.quote.AUD).toBeGreaterThan(0);
  expect(data.quote.GBP).toBeGreaterThan(0);
  expect(data.quote.ZAR).toBeGreaterThan(0);
  expect(data.quote.SBD).toBeGreaterThan(0);
})

const apiKey = await ifSecret("FinhubApiKey");
describe("FinnHubLiveTests", () => {
  it ('can fetch live rates', async () => {
    const r = await fetchNewCoinRates("1", Date.now() - ThreeDay, Date.now());
    expect(r.s).toEqual("ok");
  })
}, !!apiKey)

// it('will throw if cannot fetch', async () => {
//   expect.assertions(1);
//   const ts = Date.now();
//   await expect(fetchNewCoinRates("throwme", ts, ts))
//     .rejects
//     .toThrow("Fetch failed: Unprocessable Entity : Wrong resolution. Please check the documentation for further details.");
// })
