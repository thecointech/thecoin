import { DateTime } from 'luxon';
import { HarvestData, ProcessingStage, getDataAsDate } from '../types';
import currency from 'currency.js';

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
        const currBalance = state.harvesterBalance ?? currency(0);
        return {
          toETransfer: state.toETransfer.add(this.topUp),
          // We subtract the topUp from the harvesters balance.
          // When the transfer happens, the final balance will
          // be what it would have been without the topUp
          // (ie, the TopUp does not affect the final balance)
          // This actually works better than storing the topUp in the state
          // If the transfer fails for whatever reason, the state
          // remembers that it -should- have been transferred
          // because the topUp is encoded into the harvesterBalance
          harvesterBalance: currBalance.subtract(this.topUp),
          stepData: {
            [TopUpKey]: DateTime.now().toISO()!,
          }
        }
      }
    }
    return {};
  }
}
