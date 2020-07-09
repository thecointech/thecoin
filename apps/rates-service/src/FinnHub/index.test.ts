import { fetchNewCoinRates, fetchNewFxRates } from "./index";

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
  expect(data.quote.CAD).toBeTruthy();
})
