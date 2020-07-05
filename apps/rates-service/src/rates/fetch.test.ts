import data from './fetch.test.data.json';
import { findRateFor } from './fetchCoin';
import { CoinUpdateInterval } from './types';

it('should find a valid rate', () => {
  // Thu Jul 02 2020 13:33:30 GMT-0500 (Central Daylight Time) {}
  var queryTime = 1593714810000;
  const rate = findRateFor(queryTime, data);
  expect(rate).toBeTruthy();
  expect(rate.validFrom).toEqual(queryTime);
  expect(rate.validTill).toEqual(queryTime + CoinUpdateInterval);
})
