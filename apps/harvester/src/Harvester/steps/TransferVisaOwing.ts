import { HarvestData, ProcessingStage } from '../types';
import currency from 'currency.js';
import { log } from '@thecointech/logging';

// CalcVisaOwing - how much do we need to e-transfer?
export class TransferVisaOwing implements ProcessingStage {

  async process(data: HarvestData) {
    const harvesterBalance = data.state.harvesterBalance ?? currency(0);
    const currentOwing = data.visa.balance;

    const toETransfer = currentOwing.subtract(harvesterBalance);
    log.info(`TransferVisaOwing: Calculated visa spending at: ${toETransfer}`);
    return {
      toETransfer: toETransfer.intValue > 0 ? toETransfer : undefined,
    };
  }
}
