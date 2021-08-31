import { log } from '@thecointech/logging';
import { RbcStore } from './store';
import { ApiAction } from './action';
import { ProgressCallback, AuthOptions } from './types';

import { getTransactions, fetchLatestTransactions } from './transactions';
import { depositETransfer } from './deposit';
import { ETransferPacket } from '@thecointech/types';
import { send } from './etransfer';

export class RbcApi {

  // Create new instance with authentication.  If options are not
  // specified, attempt to read the RBCAPI_CREDENTIALS environment variable
  constructor(options?: AuthOptions)
  {
    this.initialize(options);
  }

  depositETransfer = depositETransfer;
  fetchLatestTransactions = fetchLatestTransactions;
  getTransactions = getTransactions;

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

  initialize(options?: AuthOptions) {
    ApiAction.initCredentials(options);
    RbcStore.Options = ApiAction.Credentials.timezone;
  }
}

export { RbcStore } from './store';
export * from './types';
export { initBrowser, closeBrowser } from './action';
