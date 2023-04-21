import { HarvestData, ProcessingStage } from '../types';

export class TransferEverything implements ProcessingStage {

  async process(data: HarvestData) {
    return {
      toETransfer: data.chq.balance
    }
  }
}
