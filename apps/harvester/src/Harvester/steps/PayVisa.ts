import { getDataAsDate, HarvestData, HarvestDelta, ProcessingStage, UserData } from '../types';
import { GetBillPaymentsApi, GetStatusApi } from '@thecointech/apis/broker'
import { BuildUberAction } from '@thecointech/utilities/UberAction';
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import currency from 'currency.js';
import { log } from '@thecointech/logging';
import { notify } from '@/notify';
import type { UberTransferAction } from '@thecointech/types';

export const PayVisaKey = "PayVisa";

export class PayVisa implements ProcessingStage {

  readonly name = 'PayVisa';

  // How many days prior to the due date should we pay the visa?
  daysPrior = 3;
  constructor(config?: Record<string, string|number>) {
    if (config?.daysPrior) {
      this.daysPrior = Number(config.daysPrior);
    }
    // We started running prodtest with 0 offset, continue
    else if (process.env.CONFIG_NAME==='prodtest') {
      this.daysPrior = 0;
    }
  }

  async process(data: HarvestData, user: UserData) : Promise<HarvestDelta> {
    // Do we have a new due amount?  If so, we better pay it.
    // Note, we use the date from stepData, as the date recorded as
    // state.toPayVisaDate is the date of the payment, not the due date
    const lastDueDate = getDataAsDate(PayVisaKey, data.state.stepData);

    if (!lastDueDate || (data.visa.dueDate > lastDueDate)) {

      log.info('PayVisa: Prepping payment request');

      // We better pay that due amount
      const dateToPay = await getDateToPay(data.visa.dueDate, this.daysPrior);
      log.info('PayVisa: dateToPay', dateToPay.toISO());

      // Check we don't already have a payment pending?
      if (data.state.toPayVisa != undefined) {
        log.error(
          data.state,
          'PayVisa: toPayVisa already set for {toPayVisa} with date: {toPayVisaDate}'
        );
        // But we continue regardless, cause we gotta keep up with payments
        // TODO: perhaps turn toPay into an array?
      }

      return sendPayment(dateToPay, data, user)
    }
    return {};
  }
}

async function sendPayment(dateToPay: DateTime, data: HarvestData, { wallet, creditDetails }: UserData) {
  // Send payment request
  // transfer visa dueAmount on dateToPay
  log.debug({
    amount: data.visa.dueAmount,
    dateToPay: dateToPay.toISO(),
    balance: data.visa.balance,
  }, "PayVisa: Prepping visa payment of {amount} on {dateToPay}")

  let dueAmount = data.visa.dueAmount.value;

  // If the due amount is negative, there is nothing to pay and we skip
  if (dueAmount < 0) {
    log.info('PayVisa: Due amount is negative, skipping payment');
    notify({
      icon: 'money.png',
      title: 'No payment required',
      message: `Visa due balance of ${data.visa.dueAmount} is negative and does not require a payment.`,
    })
    return {
      toPayVisa: currency(0),
      toPayVisaDate: dateToPay,
      stepData: {
        [PayVisaKey]: data.visa.dueDate.toISO()!,
      }
    }
  }
  else if (data.visa.balance.value < dueAmount) {
    // This means that the user has paid off some of their balance already
    // We don't want to pay too much so limit the payment to max at the
    // current balance of the card.
    dueAmount = data.visa.balance.value;
  }

  const payment = await BuildUberAction(
    creditDetails,
    wallet,
    process.env.WALLET_BrokerCAD_ADDRESS!,
    new Decimal(dueAmount),
    124,
    dateToPay,
  )
  const r = await sendVisaPayment(payment);
  if (r.status !== 200) {
    log.error("PayVisa: Error on uberBillPayment: ", r.data?.message);
    throw new Error(`PayVisa: Error on SendVisaPayment, Status: ${r.status}`)
  }

  const remainingBalance = (data.state.harvesterBalance ?? currency(0))
    .subtract(dueAmount);

  notify({
    icon: 'money.png',
    title: 'Payment Request Sent',
    message: `Visa balance of ${dueAmount} is scheduled to be paid ${dateToPay.toLocaleString(DateTime.DATE_MED)}.`,
  })

  log.info('PayVisa: Sent payment request, current balance remaining ', remainingBalance.toString());
  return {
    toPayVisa: currency(dueAmount), // override any existing value
    toPayVisaDate: dateToPay,
    stepData: {
      [PayVisaKey]: data.visa.dueDate.toISO()!,
    }
  }
}

export async function getDateToPay(dateToPay: DateTime, daysPrior: number) {
  // Get date to pay
  getDateFromPrior(dateToPay, daysPrior);

  // Get server time
  const timestamp = await getCurrentTime();

  // We cannot pay in the past
  return (dateToPay.toMillis() < timestamp)
    ? DateTime.fromMillis(timestamp)
    : dateToPay;
}

export function getDateFromPrior(dateToPay: DateTime, daysPrior: number) {
  let daysBack = daysPrior;
  while (daysBack > 0) {
    dateToPay = dateToPay.minus({ days: 1 });
    // Only count week days (NOTE: this is imperfect, it does not count bank holidays)
    if (dateToPay.weekday < 6) {
      daysBack--;
    }
  }
  return dateToPay
}

async function getCurrentTime() {
  try {
    return (await GetStatusApi().timestamp()).data
  }
  catch (err) {
    log.error(err, "Error getting server time");
    // Server might be down or glitching, attempt with local time
    return Date.now()
  }
}

async function sendVisaPayment(payment: UberTransferAction) {
  if (process.env.HARVESTER_DRY_RUN) {
    return {
      status: 200,
      data: {
        message: "DRY RUN: Visa payment not sent",
      }
    }
  }
  // Send payment request
  // transfer visa dueAmount on dateToPay
  const api = GetBillPaymentsApi();
  const r = await api.uberBillPayment(payment);
  log.debug({hash: r.data.hash}, "Payment sent - {hash}");
  return r;
}
