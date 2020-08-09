import { RbcTransaction, ProgressCallback } from './types';
import { getTransactions, fetchLatestTransactions } from './transactions';
import { depositETransfer } from './deposit';
import { ETransferPacket } from '@the-coin/types';
import { send } from './etransfer';
import { log } from '@the-coin/logging';
import { ApiAction, Credentials } from './action';
import { DateTimeOptions } from 'luxon';

export class RbcApi {

  //
  // Set the default credentials used for each access of this API
  // Make this a per-instance variable
  static SetCredentials(cred: Credentials) {
    ApiAction.Credentials = cred;
  }

  // Set timezone of the account.  This is important for ensuring that the
  // transactions being fecthed are assigned to the right day
  // static SetDefaultTimezone(timezone: string) {
  //   RbcStore.Options = {
  //     ...RbcStore.Options,
  //     zone: timezone
  //   }
  // }

  static ApiTimeZone: Pick<DateTimeOptions, "zone">;

  depositETransfer = (prefix: string, url: string, code: string, progressCb: ProgressCallback) =>  depositETransfer(prefix, url, code, progressCb);

  fetchLatestTransactions = () => fetchLatestTransactions();

  getTransactions = (from: Date, to: Date) : Promise<RbcTransaction[]> => getTransactions(from, to);

  sendETransfer = async (prefix: string, amount: number, name: string, packet: ETransferPacket, progressCb: ProgressCallback) => {
    try {
      progressCb("Initializing Bank API");
      return await send(prefix, amount, name, packet);
    }
    catch (e) {
      //return getErrorResult(JSON.stringify(e))
      log.error(`Error sending etransfer - ${e}`)
    }
    return -1;
  }
}

export { RbcStore } from './store';
export * from './types';
