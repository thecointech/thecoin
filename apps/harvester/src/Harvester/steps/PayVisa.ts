import { getDataAsDate, HarvestData, HarvestDelta, ProcessingStage } from '../types';
import { GetBillPaymentsApi } from '@thecointech/apis/broker'
import { BuildUberAction } from '@thecointech/utilities/UberAction';
import { getCreditDetails, getWallet } from '../config';
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import currency from 'currency.js';
import { log } from '@thecointech/logging';

const PayVisaKey = "PayVisa";

export class PayVisa implements ProcessingStage {

  // How many days prior to the due date should we pay the visa?
  daysPrior = 3;
  constructor(config?: Record<string, string|number>) {
    if (config?.daysPrior) {
      this.daysPrior = Number(config.daysPrior);
    }
  }


  async process(data: HarvestData) : Promise<HarvestDelta> {
    // Do we have a new due amount?  If so, we better pay it.

    log.info('Processing PayVisa');
    const lastDueDate = getDataAsDate(PayVisaKey, data.state.stepData);

    if (!lastDueDate || (data.visa.dueDate > lastDueDate)) {
      // We better pay that due amount
      const dateToPay = getDateToPay(data.visa.dueDate, this.daysPrior);
      log.info('PayVisa: dateToPay', dateToPay.toISO());

      const wallet = await getWallet();
      if (!wallet) {
        throw new Error("Cannot pay bill: No wallet found");
      }

      const creditDetails = await getCreditDetails();
      if (!creditDetails) {
        throw new Error("Cannot pay bill: Account Details not set");
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
        // WHAT TO DO HERE???
      }
      const harvesterBalance = (data.state.harvesterBalance ?? currency(0))
        .subtract(data.visa.dueAmount);

      log.info('Sent payment request, new balance', harvesterBalance.toString());
      return {
        toPayVisa: data.visa.dueAmount,
        harvesterBalance,
        stepData: {
          [PayVisaKey]: data.visa.dueDate.toISO()!,
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
