import { DateTime } from 'luxon';

//
// Utility functions for dealing with time
// Could go into it's own package, this is used
//

const secondsInHour = 60 * 60;
const secondsInDay = 24 * secondsInHour;
const secondsInYear = 365 * secondsInDay;
const secondsInYearIgnoreDST = secondsInYear - secondsInHour;
const secondsInWeek = 7 * secondsInDay;

// This monthly straddles assumes calendar months.  This may
// not always be correct, but the error is minimal
export const straddlesMonth = (date: DateTime) => date.day <= 7;

const leapYearsBefore = (year: number) => {
  year--;
  return Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400);
}
const leapYearsBetween = (start: DateTime, date: DateTime) => {
  let startYear = start.year;
  if (start.month > 2) startYear++;
  let endYear = date.year;
  if (date.month > 2) endYear++
  return leapYearsBefore(endYear) - leapYearsBefore(startYear);
}

export const straddlesYear = (start: DateTime, date: DateTime) => {
  // Don't use luxon for this, it's much too slow
  const diff = date.toSeconds() - start.toSeconds();
  if (diff < secondsInYearIgnoreDST) return false;

  const numLeapYears = leapYearsBetween(start, date);
  // We add an extra hour to sinceAnniversary to eliminate changes from DST
  // If DST has removed an hour, this allows the result to pass, if DST
  // has added an hour, then it won't affect the result because our test
  // (secondsInWeek) boundary is actually the day following, and adding
  // an hour is not enough to trip that.
  const sinceAnniversary = secondsInHour + (diff % secondsInYear) - (numLeapYears * secondsInDay);
  return sinceAnniversary >= 0 && sinceAnniversary < secondsInWeek;
}
