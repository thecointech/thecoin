


/* --- STATE --- */

import { DaysArray, HarvestArgs, HarvestStepType } from '../../types';

// export interface ConfigState {
//   readonly daysToRun: DaysArray,
//   readonly steps: HarvestStep[]
// }

/* --- ACTIONS --- */
export interface IActions {
  setStep(type: HarvestStepType, args:HarvestArgs): void;
  clearStep(type: HarvestStepType): void;
  setDaysToRun(daysToRun: DaysArray): void;
}
