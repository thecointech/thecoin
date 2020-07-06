import data from './fetch.test.data.json';
import { findRateFor, findValidUntil } from './fetchCoin';
import { CoinUpdateInterval } from './types';
import { alignToNextBoundary } from './fetchUtils';

it('should find a valid rate', () => {
  // Thu Jul 02 2020 13:33:30 GMT-0500 (Central Daylight Time) {}
  var queryTime = 1593714810000;
  const rate = findRateFor(queryTime, data);
  expect(rate).toBeTruthy();
  expect(rate.validFrom).toEqual(queryTime);
  expect(rate.validTill).toEqual(queryTime + CoinUpdateInterval);
})


it('Finds an appropriate boundary', () => {
  // Simple; does it find the right boundary today
  expect(alignToNextBoundary(1594050770261, CoinUpdateInterval)).toEqual(1594053090000);
})


it('generates an appropriate validTill', async () => {
  // Mon 10am
  const timestamp = 1594050770261;
  const b1 = await findValidUntil(timestamp);
  expect(b1).toEqual(1594053090000); // Mon Jul 06 2020 11:31:30 GMT-0500 (Central Daylight Time) {}

  const b2 = await findValidUntil(b1);
  expect(b2).toEqual(1594053090000 + CoinUpdateInterval);

  // What about before the market opens?
  const b3 = await findValidUntil(1594011890261);// Mon Jul 06 2020 00:04:50 GMT-0500 (Central Daylight Time) {}
  expect(b3).toEqual(1594042290000);
  // what about 00:00?
  const b4 = await findValidUntil(1594011600000);
  expect(b4).toEqual(1594042290000);

  // what about 9:31:30? (is valid time)
  const b5 = await findValidUntil(1594042290000);
  expect(b5).toEqual(1594053090000);
  // At market open 9:31
  const b6 = await findValidUntil(1594042260000)
  expect(b6).toEqual(1594053090000);

  // At market open 9:30
  const b7 = await findValidUntil(1594042200000)
  expect(b7).toEqual(1594042290000);
  const b8 = await findValidUntil(1594042200000, 1594042290000)
  expect(b8).toEqual(1594053090000);

});

