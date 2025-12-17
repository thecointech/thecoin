export enum HarvestStepType {
  // ReadVisaOwing,
  ClearPendingVisa = "ClearPendingVisa",
  EnsureHarvesterBalance = "EnsureHarvesterBalance",
  ProcessPercent = "ProcessPercent",
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

export const defaultSteps: HarvestSteps = [
  {
    type: HarvestStepType.ClearPendingVisa,
  },
  {
    type: HarvestStepType.EnsureHarvesterBalance,
  },
  {
    type: HarvestStepType.TransferVisaOwing,
  },
  {
    type: HarvestStepType.RoundUp,
    args: {
      roundPoint: 100,
    },
  },
  {
    type: HarvestStepType.ChequeMinimum,
    args: {
      limit: 200,
    },
  },
  {
    type: HarvestStepType.TransferLimit,
    args: {
      limit: 2500,
    },
  },
  { type: HarvestStepType.SendETransfer },
  { type: HarvestStepType.PayVisa },
  // Heartbeat so we can be certain the harvester is alive when remote
  { type: HarvestStepType.Heartbeat },
]

