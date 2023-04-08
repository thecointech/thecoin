


/* --- STATE --- */

import { DaysArray, HarvestStep, HarvestStepType } from '../../types';

// export interface ConfigState {
//   readonly daysToRun: DaysArray,
//   readonly steps: HarvestStep[]
// }

/* --- ACTIONS --- */
export interface IActions {
  setStep(index: HarvestStepType, step: HarvestStep|null): void;
  setDaysToRun(daysToRun: DaysArray): void;
}
