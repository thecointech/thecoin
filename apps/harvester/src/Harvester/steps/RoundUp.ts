import currency from 'currency.js';
import { HarvestData, ProcessingStage } from '../types';
import { log } from '@thecointech/logging';

export class RoundUp implements ProcessingStage {

  roundPoint = 100;

  constructor(args?: Record<string, string|number>) {
    if (args?.roundPoint) {
      this.roundPoint = Number(args.roundPoint);
    }
  }

  async process(data: HarvestData) {
    if (data.state.toETransfer) {
      log.info(`Round up ${data.state.toETransfer} by ${this.roundPoint}`);
      const toETransfer = currency(this.roundPoint * Math.ceil(data.state.toETransfer.value / this.roundPoint));
      return { toETransfer };
    }
    return {};
  }

}
