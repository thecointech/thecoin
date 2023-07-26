import { HarvestStep, HarvestStepType } from '../../types';
import { ProcessingStage } from '../types';
import { Heartbeat } from './Heartbeat';
import { PayVisa } from './PayVisa';
import { RoundUp } from './RoundUp';
import { SendETransfer } from './SendETransfer';
import { TopUp } from './TopUp';
import { TransferEverything } from './TransferEverything';
import { TransferLimit } from './TransferLimit';
import { TransferVisaOwing } from './TransferVisaOwing';

export const createStep = (step: HarvestStep|null) : ProcessingStage => {
  switch (step?.type) {
    case HarvestStepType.TransferVisaOwing: return new TransferVisaOwing();
    case HarvestStepType.RoundUp: return new RoundUp(step.args);
    case HarvestStepType.TransferEverything: return new TransferEverything();
    case HarvestStepType.TransferLimit: return new TransferLimit(step.args);
    case HarvestStepType.PayVisa: return new PayVisa(step.args);
    case HarvestStepType.TopUp: return new TopUp(step.args);
    case HarvestStepType.SendETransfer: return new SendETransfer();
    case HarvestStepType.Heartbeat: return new Heartbeat();
    default: throw new Error(`Unknown processing step: ${step!.type}`);
  }
}
