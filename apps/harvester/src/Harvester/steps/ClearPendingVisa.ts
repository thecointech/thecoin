import { DateTime } from 'luxon';
import { HarvestData, ProcessingStage, UserData } from '../types';
import currency from 'currency.js';
import { log } from '@thecointech/logging';
import { notify } from '@/notify';
import { getBalance } from './utils';

//
// Detect when a visa payment has cleared and reduce the harvester balance to match
export class ClearPendingVisa implements ProcessingStage {

  readonly name = 'ClearPendingVisa';

  async process(data: HarvestData, user: UserData) {
    // Do we have a payment pending?
    let pending = data.state.toPayVisa;
    let pendingDate = data.state.toPayVisaDate;
    let harvesterBalance = data.state.harvesterBalance ?? currency(0);
    if (pending && pendingDate) {

      // If we are before pendingDate, check that there is sufficient balance
      if (data.date < pendingDate) {
        await notifyIfInsufficientBalance(pending, user);
      }

      // Has this pending amount been applied?
      if (lastPaymentSettled(data, pending, pendingDate)) {
        // Payment completed: reduce harvester balance
        harvesterBalance = harvesterBalance.subtract(pending);
        log.info(`TransferVisaOwing: Pending payment ${pending} settled, new balance: ${harvesterBalance}`);

        if (pending.intValue != 0) {
          notify({
            title: 'Scheduled Payment Completed',
            message: `Your payment of ${pending.format()} has been settled.`,
            icon: "money.png",
          })
        }

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


function lastPaymentSettled(data: HarvestData, pending: currency, pendingDate: DateTime) : boolean {

  // It's impossible to settle before the date
  if (data.date < pendingDate) {
    log.info(`TransferVisaOwing: Cannot settle before ${pendingDate.toISODate()}!`);
    return false;
  }

  if (pending.intValue == 0) {
    log.info(`TransferVisaOwing: Pending payment is 0, no settlement required`);
    return true;
  }

  // The date has passed, is there a matching credit amount?
  // Note, we only have date, no time, so remove pending time
  const pendingClean = pendingDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  const txs = data.visa.history?.filter(r => r.date >= pendingClean)
  log.info(`TransferVisaOwing: Found ${txs?.length ?? 0} txs`);
  const matchingTx = txs?.find(r => r.values.find(v => v?.value == pending.value));
  if (matchingTx) {
    log.info(`TransferVisaOwing: Found matching credit for pending payment: ${pending}`);
    return true;
  }

  // If it's been 6 days, it's probably settled and we must have missed it
  // Send a warning though so it can be checked
  if (pendingDate < data.date.minus({ days: 6 })) {
    log.warn(`TransferVisaOwing: 6 days since pendingDate, assuming ${pending} settled`);
    return true;
  }

  log.info(`TransferVisaOwing: still waiting for pending payment`);
  return  false;
}


async function notifyIfInsufficientBalance(pending: currency, user: UserData) {
  try {
    const accountBalance = await getBalance(user);
    if (accountBalance && accountBalance < pending.value) {
      notify({
        title: 'Insufficient Balance',
        message: `Your current balance is ${accountBalance} which is less than the pending payment of ${pending}.`,
        icon: "money.png",
      })
    }
  }
  catch (err) {
    log.error(err, `ClearPendingVisa: Could not verify balance`);
    // Hopefully not a big deal, continue as normal
  }
}
