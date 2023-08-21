import { HarvestStepOrder, HarvestStepType, HarvestSteps, addStep, removeStep } from './types';

it ('correctly orders steps', () => {

  const orderCheck = Object.values(HarvestStepType);
  expect(orderCheck.length).toEqual(HarvestStepOrder.length);
  expect(orderCheck).toEqual(HarvestStepOrder);
})

it ('can add/remove steps properly', () => {

  let steps: HarvestSteps = [];
  steps = addStep({ type: HarvestStepType.ClearPendingVisa, args: {} }, steps);
  steps = addStep({ type: HarvestStepType.ClearPendingVisa, args: {} }, steps);

  expect(steps.length).toBe(1);

  steps = addStep({ type: HarvestStepType.TransferLimit, args: { limit: 200 } }, steps);
  expect(steps.length).toBe(2);
  expect(steps.map(s => s.type)).toEqual([HarvestStepType.ClearPendingVisa, HarvestStepType.TransferLimit]);

  steps = removeStep(HarvestStepType.ClearPendingVisa, steps);
  expect(steps.map(s => s.type)).toEqual([HarvestStepType.TransferLimit]);

  steps = addStep({ type: HarvestStepType.ClearPendingVisa, args: {} }, steps);
  steps = addStep({ type: HarvestStepType.TopUp, args: {} }, steps);
  steps = addStep({ type: HarvestStepType.TransferVisaOwing, args: {} }, steps);
  steps = addStep({ type: HarvestStepType.RoundUp, args: {} }, steps);
  steps = addStep({ type: HarvestStepType.TransferVisaOwing, args: {} }, steps);
  expect(steps.map(s => s.type)).toEqual([
    HarvestStepType.ClearPendingVisa,
    HarvestStepType.TransferVisaOwing,
    HarvestStepType.RoundUp,
    HarvestStepType.TopUp,
    HarvestStepType.TransferLimit
  ]);
})
