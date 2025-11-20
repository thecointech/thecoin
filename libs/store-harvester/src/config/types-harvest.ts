import { Info } from "luxon";
import type { HarvestSteps } from "./types-steps";

// Day of week is defined to match
// native js Date.getDay()
export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

export type DaysArray = [boolean, boolean, boolean, boolean, boolean, boolean, boolean];

export const toDaysArray = (...days: DayOfWeek[]) => {
  const arr: DaysArray = [false, false, false, false, false, false, false];
  days.forEach(d => arr[d] = true);
  return arr;
}
export const defaultDays = toDaysArray(DayOfWeek.Tuesday, DayOfWeek.Friday);


// Luxon mappings:
// Luxon is ISO 8601 (Monday=1, Sunday=7), but we use JS style (Sunday=0, Monday=1)
// Weirdly, this fn uses Monday=0 based (we use Sunday=0)
export const luxonInfo = (
  day: DayOfWeek,
  ...args: Parameters<typeof Info.weekdays>
) => Info.weekdays(...args)[(day + 6) % 7];

export const toDayNames = (days: DaysArray, ...args: Parameters<typeof Info.weekdays>) => days
  .map((d, idx) => d ? luxonInfo(idx as DayOfWeek, ...args) : null)
  .filter(d => !!d);

export const defaultTime = "08:00";

export type HarvestSchedule = {
  daysToRun: DaysArray,
  timeToRun: string,
}
export type HarvestConfig = {
  schedule: HarvestSchedule,
  steps: HarvestSteps,
}
