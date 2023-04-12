import { HarvestData, ProcessingStage } from '../types';

export class SendETransfer implements ProcessingStage {

  async process(data: HarvestData) {
    //TODO
    debugger;
    return data;
    // return {
    //   ...data,
    //   toCoin: data.chq.balance
    // }
  }

}
