import { DateTime } from 'luxon';
import { HarvestData, ProcessingStage, getDataAsDate } from '../types';

const TopUpKey = 'TopUp';
export class TopUp implements ProcessingStage {

  topUp = 10;

  constructor(config?: Record<string, string|number>) {
    if (config?.topUp) {
      this.topUp = Number(config.topUp);
    }
  }

  async process({state}: HarvestData) {
    // Each (month?) we add topUp to the amount to transfer
    if (state.toETransfer) {
      const lastDate = getDataAsDate(TopUpKey, state.stepData);
      if (!lastDate || lastDate.plus({months: 1}) < DateTime.now()) {
        return {
          toETransfer: state.toETransfer.add(this.topUp),
          stepData: {
            [TopUpKey]: DateTime.now().toISO()!,
          }
        }
      }
    }
    return {};
  }
}
