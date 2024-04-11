import { log } from '@thecointech/logging';
import { HarvestData, ProcessingStage } from '../types';

export class TransferLimit implements ProcessingStage {

  readonly name = 'TransferLimit';

  limit = 200;

  constructor(config?: Record<string, string|number>) {
    if (config?.limit) {
      this.limit = Number(config.limit);
    }
  }

  async process(data: HarvestData) {
    if (data.state.toETransfer) {
      log.info('Protecting chq minimum balance of ' + this.limit);
      const maxTransfer = data.chq.balance.subtract(
        Math.min(this.limit, data.chq.balance.value)
      );
      if (maxTransfer.value < data.state.toETransfer.value) {
        log.info('Limiting transfer to ' + maxTransfer);
        return {
          toETransfer: maxTransfer,
        }
      }
    }
    return {};
  }
}
