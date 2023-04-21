

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

export enum HarvestStepType {
  // ReadVisaOwing,
  TransferVisaOwing,
  RoundUp,
  TransferEverything,
  TopUp,
  TransferLimit,
  SendETransfer,
  PayVisa,
}

export type HarvestArgs = Record<string, string|number>

export type HarvestStep = {
  type: HarvestStepType,
  args?: HarvestArgs,
}

export type HarvestConfig = {
  daysToRun: DaysArray,
  steps: Array<HarvestStep|null>,
    // HarvestStep|null, // RoundUp,
    // HarvestStep|null, // TransferEverything,
    // HarvestStep|null, // TopUp,
    // HarvestStep|null, // TransferLimit,
    // HarvestStep|null, // SendETransfer
    // HarvestStep|null, // PayVisa
  // ]
}
