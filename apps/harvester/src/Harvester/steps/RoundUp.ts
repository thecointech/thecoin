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
    if (data.toETransfer) {
      log.info(`Round up ${data.toETransfer} to ${this.roundPoint}`);
      return {
        ...data,
        toCoin: currency(this.roundPoint * Math.ceil(data.toETransfer.value / this.roundPoint)),
      }
    }
    return data;
  }

}
