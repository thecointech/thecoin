import { fetchCoinRate } from "./fetchCoin";
import { CoinUpdateInterval } from "./types";

// Don't go to the server for this
jest.mock('../FinnHub')

it('should find a valid rate', async () => {

  // We have to query NextOpenTimestamp
  jest.setTimeout(30000);

  // Thu Jul 02 2020 08:35:10 GMT-0500 (Central Daylight Time)
  const lastValid = 1593696917000;
  var now = lastValid + (24 * 60 * 60 * 1000);
  const rates = await fetchCoinRate(lastValid, now);
  expect(rates.length).toEqual(3);
  const firstRate = rates[0];
  const lastRate = rates.pop()!;
  expect(firstRate.validFrom).toEqual(lastValid);
  for (let i = 0; i < rates.length; i++)
  {
    expect(rates[i].validTill).toBeLessThan(now)
    expect(rates[i].validTill - rates[i].validFrom).toBeLessThanOrEqual(CoinUpdateInterval)

  }
  // validTill: Thu Jul 02 2020 14:31:30 GMT-0500 (Central Daylight Time) {}
  expect(lastRate.validTill).toBeGreaterThan(now);
})

