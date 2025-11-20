import { toDaysArray, DayOfWeek, DaysArray, toDayNames, luxonInfo } from "./types-harvest";


it('converts days to names', () => {
  const days = toDaysArray(DayOfWeek.Tuesday, DayOfWeek.Friday);
  expect(toDayNames(days, 'long')).toEqual(['Tuesday', 'Friday']);
  expect(toDayNames(days, 'short')).toEqual(['Tue', 'Fri']);

  // Round-trip all days
  const allDays = Object.values(DayOfWeek).filter((d): d is DayOfWeek => typeof d === 'number');
  const allDaysArray = toDaysArray(...allDays);
  const allNames = toDayNames(allDaysArray, 'long');
  for (let i = 0; i < allNames.length; i++) {
    expect(allNames[i]).toEqual(DayOfWeek[i].toString());
    expect(luxonInfo(i, 'long')).toEqual(allNames[i]);
  }
})

it('aligns DayOfWeek with JS Date', () => {
  expect(DayOfWeek.Monday).toEqual(1);
  const now = new Date();
  // If js days match DayOfWeek, this will pass
  const dayStr = luxonInfo(now.getDay(), "short");
  expect(now.toString()).toContain(dayStr);
})
