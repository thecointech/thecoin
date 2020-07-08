import { findValidUntil, fetchCoinRate } from './fetchCoin';
import { CoinUpdateInterval } from './types';
import { alignToNextBoundary } from './fetchUtils';
import { DateTime } from 'luxon';

// Don't go to the server for this
jest.mock('../FinnHub')

it('should find a valid rate', async () => {

  // Thu Jul 02 2020 13:33:30 GMT-0500 (Central Daylight Time) {}
  var queryTime = 1593714810000;
  const rate = await fetchCoinRate(queryTime, queryTime + 10000);
  expect(rate).toBeTruthy();
  expect(rate!.validFrom).toEqual(queryTime);
  // validTill: Thu Jul 02 2020 14:31:30 GMT-0500 (Central Daylight Time) {}
  expect(rate!.validTill).toEqual(1593718290000);
})

it('Finds an appropriate boundary', () => {

  const alignDtToNextBoundary = (dt: DateTime) => alignToNextBoundary(dt.toMillis(), CoinUpdateInterval);
  // Simple; does it find the right boundary today
  expect(alignToNextBoundary(1594050770261, CoinUpdateInterval)).toEqual(1594053090000);

  // Complicated: daylight saving
  const dstDate = DateTime.fromObject({
    year: 2020,
    month: 3,
    day: 8,
    hour: 2,
    zone: "America/New_York",
  });

  // The following tests still fail: DST is hard...

  // Back to midnight
  const t3 = alignDtToNextBoundary(dstDate.minus({ hours: 2 }));
  // before DST
  const t4 = alignDtToNextBoundary(dstDate.minus({ minutes: 30 }));
  // Exactly on DST
  const t1 = alignDtToNextBoundary(dstDate);
  // After DST
  const t2 = alignDtToNextBoundary(dstDate.plus({ minutes: 5 }));
  // 6am
  const t5 = alignDtToNextBoundary(dstDate.plus({ hours: 3 }));
  // 9am
  const t6 = alignDtToNextBoundary(dstDate.plus({ hours: 6 }));
  // End of day
  const t7 = alignDtToNextBoundary(dstDate.plus({ hours: 21, minutes: 59}));
  expect(t1).toBe(123);
  expect(t2).toBe(123);
  expect(t3).toBe(123);
  expect(t4).toBe(123);
  expect(t5).toBe(123);
  expect(t6).toBe(123);
  expect(t7).toBe(123);
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

