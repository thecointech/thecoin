import { HarvestData, ProcessingStage } from '../types';

export class TransferLimit implements ProcessingStage {

  limit = 200;

  constructor(config?: Record<string, string|number>) {
    if (config?.limit) {
      this.limit = Number(config.limit);
    }
  }

  async process(data: HarvestData) {
    if (data.toETransfer) {
      const maxTransfer = data.chq.balance.subtract(this.limit);
      if (maxTransfer.value < data.toETransfer.value) {
        return {
          ...data,
          toCoin: maxTransfer,
        }
      }
    }
    return data;
  }

}
