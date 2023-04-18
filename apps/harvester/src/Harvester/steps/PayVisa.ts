import { HarvestData, ProcessingStage } from '../types';
import { GetBillPaymentsApi } from '@thecointech/apis/broker'
import { BuildUberAction } from '@thecointech/utilities/UberAction';
import { getCreditDetails, getWallet } from '../config';
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import type { BillPayeePacket } from '@thecointech/types';

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
      const dateToPay = getDateToPay(data.visa.dueDate, this.daysPrior);

      const wallet = await getWallet();
      if (!wallet) {
        throw new Error("Cannot pay bill: No wallet found");
      }

      const creditDetails = await getCreditDetails();
      if (!creditDetails) {
        throw new Error("Cannot pay bill: Account Details not set");
      }

      const api = GetBillPaymentsApi();
      const payment = await BuildUberAction(
        creditDetails,
        wallet,
        process.env.WALLET_BrokerCAD_ADDRESS!,
        new Decimal(data.visa.dueAmount.value),
        124,
        dateToPay,
      )
      await api.uberBillPayment(payment);

      // transfer visa dueAmount on dateToPay
    }
    return data;
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
