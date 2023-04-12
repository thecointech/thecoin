import currency from 'currency.js';
import { HarvestData, ProcessingStage } from '../types';


export class TransferVisaOwing implements ProcessingStage {

  async process(data: HarvestData, lastState?: HarvestData) {
    const currentBalance = data.visa.balance;
    let priorBalance = lastState?.visa.balance ?? currency(0);

    // Do we have a payment pending?
    let pending = lastState?.payVisa;
    if (pending) {
      // Has this pending amount been applied?
      const payments = data.visa.history.filter(r => r.credit);
      const pendingPayment = payments.filter(r => r.credit === pending);
      if (pendingPayment.length > 0) {
        // Tx happened, reduce prior balance
        priorBalance = priorBalance.subtract(pending);
        pending = undefined;
      }
      // else, we should probably validate we haven't missed it.
    }


    const toCoin = currentBalance.subtract(priorBalance);
    if (toCoin.intValue > 0) {
      return {
        ...data,
        toCoin,
      }
    }
    return data;
  }
}
