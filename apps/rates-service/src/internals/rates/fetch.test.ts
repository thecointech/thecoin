import { findValidUntil } from './fetchCoin';
import { CoinUpdateInterval } from './types';
import { alignToNextBoundary } from './fetchUtils';
import { DateTime } from 'luxon';

it('Finds an appropriate boundary on DST Start', () => {

  const alignDtToNextBoundary = (dt: DateTime) => alignToNextBoundary(dt.toMillis(), CoinUpdateInterval);
  // Simple; does it find the right boundary today
  expect(alignToNextBoundary(1594050770261, CoinUpdateInterval)).toEqual(1594053090000);

  const padded = (n: number) => n.toString().padStart(2, "0")
  const clockTime = (dt: DateTime) => `${padded(dt.hour)}:${padded(dt.minute)}:${padded(dt.second)}`;
  const testOffset = (dt: DateTime, expected: string) => {
    const ts = alignDtToNextBoundary(dt);
    const rdt = DateTime.fromMillis(ts);
    expect(clockTime(rdt)).toEqual(expected);
  }

  const TestDstBoundary = (dstDate: DateTime) => {
    // Back to midnight
    testOffset(dstDate.minus({ hours: 2 }), "00:31:30")
    // before DST
    testOffset(dstDate.minus({ minutes: 30 }), "03:31:30");
    // Exactly on DST
    testOffset(dstDate, "03:31:30");
    // After DST
    testOffset(dstDate.plus({ minutes: 5 }), "03:31:30");
    // 6am
    testOffset(dstDate.plus({ hours: 3 }), "06:31:30");
    // 9am
    testOffset(dstDate.plus({ hours: 6 }), "09:31:30");
  }

  // Complicated: daylight saving start
  const dstStart = DateTime.fromObject({
    year: 2020,
    month: 3,
    day: 8,
    hour: 2
  })
  TestDstBoundary(dstStart);
  // End of day
  const nextDayStart = alignDtToNextBoundary(dstStart.plus({ hours: 20, minutes: 59}));
  expect(DateTime.fromMillis(nextDayStart).toString()).toEqual("2020-03-09T00:31:30.000-04:00");
  // After DST
  testOffset(dstStart.plus({ hours: 1, minutes: 5 }), "06:31:30");

  // Complicated: daylight saving end
  const dstEnd = DateTime.fromObject({
    year: 2020,
    month: 11,
    day: 3,
    hour: 2
  })
  TestDstBoundary(dstEnd);
  // After DST
  testOffset(dstEnd.plus({ hours: 1, minutes: 5 }), "03:31:30");

  // End of day
  const nextDayEnd = alignDtToNextBoundary(dstEnd.plus({ hours: 20, minutes: 59}));
  expect(DateTime.fromMillis(nextDayEnd).toString()).toEqual("2020-11-04T00:31:30.000-05:00");
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
});

