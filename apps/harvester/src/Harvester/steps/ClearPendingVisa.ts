import { DateTime } from 'luxon';
import { HarvestData, ProcessingStage } from '../types';
import currency from 'currency.js';
import { log } from '@thecointech/logging';

//
// Detect when a visa payment has cleared and reduce the harvester balance to match
export class ClearPendingVisa implements ProcessingStage {

  async process(data: HarvestData) {
    // Do we have a payment pending?
    let pending = data.state.toPayVisa;
    let pendingDate = data.state.toPayVisaDate;
    let harvesterBalance = data.state.harvesterBalance ?? currency(0);
    if (pending) {

      // Has this pending amount been applied?
      if (lastPaymentSettled(data, pending, pendingDate)) {
        // Payment completed: reduce harvester balance
        harvesterBalance = harvesterBalance.subtract(pending);
        log.info(`TransferVisaOwing: Pending payment ${pending} settled, new balance: ${harvesterBalance}`);
        pending = undefined;
        pendingDate = undefined;
      }
    }

    return {
      toPayVisa: pending,
      toPayVisaDate: pendingDate,
      harvesterBalance,
    };
  }
}


function lastPaymentSettled(data: HarvestData, pending: currency, pendingDate?: DateTime) : boolean {

  // It's impossible to settle before the date
  if (pendingDate && pendingDate < DateTime.now()) {
    return false;
  }

  // The date has passed, is there a matching credit amount?
  const payments = data.visa.history.filter(r => r.credit?.intValue);
  log.info(`TransferVisaOwing: Found ${payments.length} credits`);
  const pendingPayment = payments.filter(r => r.credit === pending);
  if (pendingPayment.length > 0) {
    log.info(`TransferVisaOwing: Found matching credit for pending payment: ${pending}`);
    return true;
  }

  // If it's been 6 days, it's probably settled and we must have missed it
  if (pendingDate && pendingDate < DateTime.now().minus({ days: 6 })) {
    log.info(`TransferVisaOwing: 6 days since pendingDate, assuming ${pending} settled`);
    return true;
  }

  log.info(`TransferVisaOwing: still waiting for pending payment`);
  return  false;
}
