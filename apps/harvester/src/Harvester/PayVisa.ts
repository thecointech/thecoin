import { HarvestData, ProcessingStage } from './types';
import { GetBillPaymentsApi } from '@thecointech/apis/broker'
import { BuildUberAction } from '@thecointech/utilities/UberAction';
import { getWallet } from './config';
import Decimal from 'decimal.js-light';

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
        // Only count week days (NOTE: this is imperfect, it does not count bank holidays)
        if (dateToPay.weekday < 6) {
          daysBack--;
        }
      }

      const wallet = await getWallet();
      if (!wallet) {
        throw new Error("Cannot pay bill: No wallet found");
      }
      const api = GetBillPaymentsApi();
      const payment = await BuildUberAction(
        {} as any,
        wallet,
        process.env.WALLET_BrokerCAD_ADDRESS!,
        new Decimal(data.visa.dueAmount.value),
        124,
        dateToPay,
      )
      api.uberBillPayment(payment);

      // transfer visa dueAmount on dateToPay
    }
    return data;
  }

}
