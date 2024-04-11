import currency from 'currency.js';
import { HarvestData, ProcessingStage } from '../types';
import { log } from '@thecointech/logging';

export class RoundUp implements ProcessingStage {

  readonly name = 'RoundUp';

  roundPoint = 100;

  constructor(args?: Record<string, string|number>) {
    if (args?.roundPoint) {
      this.roundPoint = Number(args.roundPoint);
    }
  }

  async process(data: HarvestData) {
    if (data.state.toETransfer) {
      const toETransfer = currency(this.roundPoint * Math.ceil(data.state.toETransfer.value / this.roundPoint));
      log.info(`Round up ${data.state.toETransfer} by ${this.roundPoint} to ${toETransfer}`);
      return { toETransfer };
    }
    return {};
  }

}
