import { DateTime } from 'luxon';
import { HarvestData, ProcessingStage, getDataAsCurrency, getDataAsDate } from '../types';
import currency from 'currency.js';
import { log } from '@thecointech/logging';

const TransferVisaOwingKey = 'TransferVisaOwing';

export class TransferVisaOwing implements ProcessingStage {

  async process(data: HarvestData) {
    const currentBalance = data.visa.balance;
    let priorBalance = getDataAsCurrency(TransferVisaOwingKey, data.state.stepData);

    // Do we have a payment pending?
    let pending = data.state.toPayVisa;
    if (pending) {

      // Has this pending amount been applied?
      if (lastPaymentSettled(data, pending)) {
        log.info(`TransferVisaOwing: Pending payment settled`);
        // Tx happened, reduce prior balance
        priorBalance = priorBalance.subtract(pending);
        pending = undefined;
      }
    }

    const toETransfer = currentBalance.subtract(priorBalance);
    log.info(`TransferVisaOwing: Calculated visa spending at: ${toETransfer}`);
    return {
      toETransfer: toETransfer.intValue > 0 ? toETransfer : undefined,
      toPayVisa: pending,
      stepData: {
        [TransferVisaOwingKey]: currentBalance.toString(),
      }
    };
  }
}


function lastPaymentSettled(data: HarvestData, pending: currency) : boolean {
  const payments = data.visa.history.filter(r => r.credit);
  const pendingPayment = payments.filter(r => r.credit === pending);
  if (pendingPayment.length > 0) {
    return true;
  }
  // If it's been 6 days, it's probably settled and we must have missed it
  const lastPayDate = getDataAsDate('PayVisaKey', data.state.stepData);
  return (lastPayDate && lastPayDate < DateTime.now().minus({ days: 6 })) ?? false;
}
