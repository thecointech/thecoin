import { HarvestStep, HarvestSteps, HarvestStepType } from "@thecointech/store-harvester";

export type * from "@thecointech/store-harvester";

// Until we have a proper graph, just explicitly set an order
export const HarvestStepOrder = [
  HarvestStepType.ClearPendingVisa,
  HarvestStepType.EnsureHarvesterBalance,
  HarvestStepType.ProcessPercent,
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
