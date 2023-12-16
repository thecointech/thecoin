import { getDataAsDate, HarvestData, HarvestDelta, ProcessingStage, UserData } from '../types';
import { GetBillPaymentsApi } from '@thecointech/apis/broker'
import { BuildUberAction } from '@thecointech/utilities/UberAction';
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import currency from 'currency.js';
import { log } from '@thecointech/logging';
import { notify, notifyError } from '../notify';

export const PayVisaKey = "PayVisa";

export class PayVisa implements ProcessingStage {

  // How many days prior to the due date should we pay the visa?
  daysPrior = 3;
  constructor(config?: Record<string, string|number>) {
    if (config?.daysPrior) {
      this.daysPrior = Number(config.daysPrior);
    }
  }


  async process(data: HarvestData, { wallet, creditDetails }: UserData) : Promise<HarvestDelta> {
    // Do we have a new due amount?  If so, we better pay it.

    log.info('Processing PayVisa');
    const lastDueDate = getDataAsDate(PayVisaKey, data.state.stepData);

    if (!lastDueDate || (data.visa.dueDate > lastDueDate)) {
      // We better pay that due amount
      const dateToPay = getDateToPay(data.visa.dueDate, this.daysPrior);
      log.info('PayVisa: dateToPay', dateToPay.toISO());

      if (data.state.toPayVisa != undefined) {
        log.error(
          data.state,
          'PayVisa: toPayVisa already set for {toPayVisa} with date: {toPayVisaDate}'
        );
        // But we continue regardless, cause we gotta keep up with payments
        // TODO: perhaps turn toPay into an array?
      }

      // transfer visa dueAmount on dateToPay
      const api = GetBillPaymentsApi();
      const payment = await BuildUberAction(
        creditDetails,
        wallet,
        process.env.WALLET_BrokerCAD_ADDRESS!,
        new Decimal(data.visa.dueAmount.value),
        124,
        dateToPay,
      )
      const r = await api.uberBillPayment(payment);
      if (r.status !== 200) {
        log.error("Error on uberBillPayment: ", r.data.message);

        notifyError({
          title: 'Harvester Error',
          message: 'Submitting a payment request failed.  Please contact support.',
        })
        // WHAT TO DO HERE???
      }
      else {
        const remainingBalance = (data.state.harvesterBalance ?? currency(0))
          .subtract(data.visa.dueAmount);

        notify({
          icon: 'money.png',
          title: 'Payment Request Sent',
          message: `Visa balance of ${data.visa.dueAmount} is scheduled to be paid ${dateToPay.toLocaleString(DateTime.DATE_MED)}.`,
        })

        log.info('Sent payment request, current balance remaining ', remainingBalance.toString());
        return {
          toPayVisa: data.visa.dueAmount.add(data.state.toPayVisa ?? 0),
          toPayVisaDate: dateToPay,
          stepData: {
            [PayVisaKey]: data.visa.dueDate.toISO()!,
          }
        }
      }
    }
    return {};
  }
}

export function getDateToPay(dateToPay: DateTime, daysPrior: number) {
  let daysBack = daysPrior;
  while (daysBack > 0) {
    dateToPay = dateToPay.minus({ days: 1 });
    // Only count week days (NOTE: this is imperfect, it does not count bank holidays)
    if (dateToPay.weekday < 6) {
      daysBack--;
    }
  }
  return dateToPay;
}
