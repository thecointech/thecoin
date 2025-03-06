import { HarvestStep, HarvestStepType } from '../../types';
import { ProcessingStage } from '../types';
import { ClearPendingVisa } from './ClearPendingVisa';
import { Heartbeat } from './Heartbeat';
import { PayVisa } from './PayVisa';
import { RoundUp } from './RoundUp';
import { SendETransfer } from './SendETransfer';
import { TopUp } from './TopUp';
import { TransferEverything } from './TransferEverything';
import { ChequeMinimum } from './ChequeMinimum';
import { TransferLimit } from './TransferLimit';
import { TransferVisaOwing } from './TransferVisaOwing';
import { ProcessPercent } from './ProcessPercent';
import { EnsureHarvesterBalance } from './EnsureHarvesterBalance';

export const createStep = (step: HarvestStep) : ProcessingStage => {
  switch (step.type) {
    case HarvestStepType.ClearPendingVisa: return new ClearPendingVisa();
    case HarvestStepType.EnsureHarvesterBalance: return new EnsureHarvesterBalance();
    case HarvestStepType.ProcessPercent: return new ProcessPercent(step.args);
    case HarvestStepType.TransferVisaOwing: return new TransferVisaOwing();
    case HarvestStepType.RoundUp: return new RoundUp(step.args);
    case HarvestStepType.TransferEverything: return new TransferEverything();
    case HarvestStepType.ChequeMinimum: return new ChequeMinimum(step.args);
    case HarvestStepType.TransferLimit: return new TransferLimit(step.args);
    case HarvestStepType.PayVisa: return new PayVisa(step.args);
    case HarvestStepType.TopUp: return new TopUp(step.args);
    case HarvestStepType.SendETransfer: return new SendETransfer();
    case HarvestStepType.Heartbeat: return new Heartbeat();
    default: throw new Error(`Unknown processing step: ${step!.type}`);
  }
}
