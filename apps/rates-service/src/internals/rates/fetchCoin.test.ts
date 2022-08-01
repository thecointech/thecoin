import { fetchCoinRate } from "./fetchCoin";

it('should find a valid rate', async () => {
  // Fri Jul 02 2021 15:51:00 GMT-0500 (Central Daylight Saving Time)
  const lastValid = 1625259060000;
  // Our data starts Fri, extends over the weekend until Monday 12pm
  var now = lastValid + (70 * 60 * 60 * 1000);
  const rates = await fetchCoinRate(lastValid, now);
  expect(rates.length).toEqual(3);
  const firstRate = rates[0];
  const lastRate = rates.pop()!;
  expect(firstRate.validFrom).toEqual(lastValid);
  for (let i = 0; i < rates.length; i++)
  {
    expect(rates[i].validTill).toBeLessThan(now)
  }
  // validTill: Mon Jul 05 2021 14:31:30 GMT-0500 (Central Daylight Saving Time)
  expect(lastRate.validTill).toBeGreaterThan(now);
})

