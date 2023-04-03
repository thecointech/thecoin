import { HarvestData, ProcessingStage } from './types';

export class PayVisa implements ProcessingStage {

  // How many days prior to the due date should we pay the visa?
  daysPrior = 3;
  constructor(config?: Record<string, string|number>) {
    if (config?.daysPrior) {
      this.daysPrior = Number(config.daysPrior);
    }
  }

  async process(data: HarvestData, lastState?: HarvestData) {
    // Do we have a new due amount?  If so, we better pay it.

    if (!lastState || (data.visa.dueDate > lastState?.visa.dueDate)) {
      // We better pay that due amount 
      let dateToPay = data.visa.dueDate;
      let daysBack = this.daysPrior;
      while (daysBack > 0) {
        dateToPay = dateToPay.minus({ days: 1 });
        // Only count week days (NOTE: this is very imperfect, it does not count bank holidays)
        if (dateToPay.weekday < 6) {
          daysBack--;
        }
      }

      // transfer visa dueAmount on dateToPay
    }
    return data;
  }

}