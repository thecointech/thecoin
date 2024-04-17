

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

export enum HarvestStepType {
  // ReadVisaOwing,
  ClearPendingVisa = "ClearPendingVisa",
  TransferVisaOwing = "TransferVisaOwing",
  RoundUp = "RoundUp",
  TransferEverything = "TransferEverything",
  TopUp = "TopUp",
  ChequeMinimum = "ChequeMinimum",
  TransferLimit = "TransferLimit",
  SendETransfer = "SendETransfer",
  PayVisa = "PayVisa",
  Heartbeat = "Heartbeat",
}

export type HarvestArgs = Record<string, string|number>

export type HarvestStep = {
  type: HarvestStepType,
  args?: HarvestArgs,
}
export type HarvestSteps = Array<HarvestStep>;

export type HarvestSchedule = {
  daysToRun: DaysArray,
  timeToRun: string,
}
export type HarvestConfig = {
  schedule: HarvestSchedule,
  steps: HarvestSteps,
}

// Until we have a proper graph, just explicitly set an order
export const HarvestStepOrder = [
  HarvestStepType.ClearPendingVisa,
  HarvestStepType.TransferVisaOwing,
  HarvestStepType.RoundUp,
  HarvestStepType.TransferEverything,
  HarvestStepType.TopUp,
  HarvestStepType.ChequeMinimum,
  HarvestStepType.TransferLimit,
  HarvestStepType.SendETransfer,
  HarvestStepType.PayVisa,
  HarvestStepType.Heartbeat,
]

export function addStep(step: HarvestStep, steps: HarvestSteps) {
  return [
    ...removeStep(step.type, steps),
    step,
  ].sort((l, r) => HarvestStepOrder.indexOf(l.type) - HarvestStepOrder.indexOf(r.type));
}

export function removeStep (type: HarvestStepType, steps: HarvestSteps) {
  return steps.filter(s => s.type !== type);
}
