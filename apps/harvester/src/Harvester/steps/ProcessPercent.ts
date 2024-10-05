import { HarvestData, ProcessingStage } from '../types';
import { log } from '@thecointech/logging';

export class ProcessPercent implements ProcessingStage {

  readonly name = 'ProcessPercent';

  percent = 100;

  constructor(args?: Record<string, string|number>) {
    if (args?.percent) {
      this.percent = Number(args.percent);
    }
  }

  async process(data: HarvestData) {
    if (this.percent != 100) {
      const balance = data.visa.balance?.multiply(this.percent / 100)
      const dueAmount = data.visa.dueAmount?.multiply(this.percent / 100)
      log.info(`Reducing visa by ${this.percent}% to balance: ${balance}, due amount: ${dueAmount}`);

      // Note, this is destructive, unlike all the other steps
      // Does it matter?  Not right now
      data.visa.balance = balance
      data.visa.dueAmount = dueAmount
    }
    return {}
  }
}
