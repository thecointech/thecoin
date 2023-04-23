import { log } from '@thecointech/logging';
import { HarvestData, ProcessingStage } from '../types';

export class TransferEverything implements ProcessingStage {

  async process(data: HarvestData) {
    log.info("Transferring everything");
    return {
      toETransfer: data.chq.balance
    }
  }
}
