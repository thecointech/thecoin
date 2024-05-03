import { log } from '@thecointech/logging';
import { HarvestData, ProcessingStage } from '../types';
import currency from 'currency.js';

export class TransferLimit implements ProcessingStage {

  readonly name = 'TransferLimit';

  limit = currency(2500);

  constructor(config?: Record<string, string|number>) {
    if (config?.limit) {
      this.limit = currency(config.limit);
    }
  }

  async process(data: HarvestData) {
    if (data.state.toETransfer) {
      if (this.limit.value < data.state.toETransfer.value) {
        log.warn(`Requested e-transfer is too large: ${data.state.toETransfer}, max ${this.limit}`);
        return {
          toETransfer: this.limit,
        }
      }
    }
    return {};
  }
}
