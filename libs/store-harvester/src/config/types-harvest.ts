import { HarvestSteps } from "./types-steps";

export type DaysArray = [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
export const defaultDays: DaysArray = [
  false,
  true,   // Tuesday
  false,
  false,
  true,   // Friday
  false,
  false,
]
export const defaultTime = "08:00";

export type HarvestSchedule = {
  daysToRun: DaysArray,
  timeToRun: string,
}
export type HarvestConfig = {
  schedule: HarvestSchedule,
  steps: HarvestSteps,
}
