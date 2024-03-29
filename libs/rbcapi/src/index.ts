import { log } from '@thecointech/logging';
import type { IBank, ProgressCallback} from '@thecointech/bank-interface';
import { ETransferPacket } from '@thecointech/types';
import { RbcStore } from './store';
import { ApiAction } from './action';
import { AuthOptions } from './types';
import { getTransactions, fetchLatestTransactions } from './transactions';
import { depositETransfer } from './deposit';
import { send } from './etransfer';
import { payBill } from './bills';

export class RbcApi implements IBank {

  // Create new instance with authentication.  If options are not
  // specified, attempt to read the RBCAPI_CREDENTIALS environment variable
  constructor(options?: AuthOptions)
  {
    this.initialize(options);
  }

  depositETransfer = depositETransfer;
  fetchLatestTransactions = fetchLatestTransactions;
  getTransactions = getTransactions;
  payBill = payBill;

  sendETransfer = async (prefix: string, amount: number, name: string, packet: ETransferPacket, progressCb: ProgressCallback) => {
    try {
      progressCb("Initializing Bank API");
      return await send(prefix, amount, name, packet);
    }
    catch (e: any) {
      //return getErrorResult(JSON.stringify(e))
      log.error(e, `Error sending etransfer - ${e}`)
    }
    return -1;
  }

  initialize(options?: AuthOptions) {
    ApiAction.initCredentials(options);
    RbcStore.Options = ApiAction.Credentials.timezone;
  }
}

export { RbcStore } from './store';
export * from './types';
export * from '@thecointech/bank-interface';
export { closeBrowser } from './scraper';
