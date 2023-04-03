import currency from 'currency.js';
import { HarvestData, ProcessingStage } from './types';

export class RoundUp implements ProcessingStage {

  roundPoint = 100;

  constructor(args?: Record<string, string|number>) {
    if (args?.roundPoint) {
      this.roundPoint = Number(args.roundPoint);
    }
  }

  async process(data: HarvestData) {
    if (data.toCoin) {
      return {
        ...data,
        toCoin: currency(this.roundPoint * Math.ceil(data.toCoin.intValue / this.roundPoint)),
      }
    }
    return data;
  }

}