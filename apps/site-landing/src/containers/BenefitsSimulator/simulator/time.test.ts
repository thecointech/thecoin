import lodash from 'lodash';
import { DateTime } from 'luxon';
import { straddlesMonth, weekContainedAnniversary } from './time';

it('correctly straddles months', () => {
  const straddlesM = (month: number, day: number) =>
    straddlesMonth(DateTime.fromObject({month, day}));
  expect(straddlesM(1, 31)).toBeFalsy()
  expect(straddlesM(2, 1)).toBeTruthy()
  expect(straddlesM(2, 7)).toBeTruthy()
  expect(straddlesM(2, 8)).toBeFalsy()
  // We should have 7 * 12 days straddling months within a year
  const jan1 = DateTime.fromObject({month: 1, day: 1});
  const allStraddles = lodash.range(0, 365).reduce((acc, days) => {
    const d = jan1.plus({days});
    const s = straddlesMonth(d);
    return s ? acc + 1 : acc;
  }, 0);
  expect(allStraddles).toBe(12 * 7);
})

it('correctly straddles years', () => {
  {
    const start = DateTime.fromObject({year: 1981, month: 2});
    const straddlesY = (year: number, month: number, day: number) =>
      weekContainedAnniversary(start, DateTime.fromObject({year, month, day}));
    expect(straddlesY(1981, 2, 1)).toBeFalsy();
    expect(straddlesY(1982, 12, 31)).toBeFalsy();
    expect(straddlesY(1983, 1, 1)).toBeFalsy();
    expect(straddlesY(1983, 2, 1)).toBeTruthy();
    expect(straddlesY(1983, 2, 7)).toBeTruthy();
    expect(straddlesY(1983, 2, 8)).toBeFalsy();
    expect(straddlesY(1983, 6, 1)).toBeFalsy();
  }

  {
    // We should have 7 * 15 days straddling years in 15 years
    const randInt = (n: number) => 1 + Math.floor(Math.random() * n);
    const start = DateTime.fromObject({ year: 1900 + randInt(100), month: randInt(12), day: randInt(28) });
    try {
      const end = start.plus({years: 25});
      const numDays = end.diff(start, "day").days;
      const allStraddles = lodash.range(0, numDays).reduce((acc, days) => {
        const d = start.plus({ days });
        const s = weekContainedAnniversary(start, d);

        // Double check using Luxon
        const diff = d.diff(start, ["years", "days"]);
        const luxonOp = diff.years > 0 && diff.days < 7;
        expect(luxonOp).toEqual(s);
        return s ? acc + 1 : acc;
      }, 0);
      expect(allStraddles).toBe(24 * 7);
    }
    catch(err) {
      console.log(`Error thrown on start: ${start}`);
      throw err;
    }
  }
})
