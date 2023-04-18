import { HarvestData, ProcessingStage } from '../types';

export class TopUp implements ProcessingStage {

  topUp = 10;

  constructor(config?: Record<string, string|number>) {
    if (config?.topUp) {
      this.topUp = Number(config.topUp);
    }
  }

  async process(data: HarvestData) {
    // Each (month?) we add topUp to the amount to transfer
    // TODO: NOT YET IMPLEMENTED
    if (!data.toETransfer) return data;
    return {
      ...data,
      toCoin: data.toETransfer.add(this.topUp),
    }
  }

}
