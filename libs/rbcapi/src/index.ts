import { log } from '@thecointech/logging';
import { readFileSync } from 'fs';
import { RbcStore } from './store';
import { ApiAction } from './action';
import { ProgressCallback, isCredentials, AuthOptions } from './types';

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
    if (isCredentials(options))
      ApiAction.Credentials = options;
    else if (options?.authFile) {
      // it's a json file
      const cred = readFileSync(options.authFile, 'utf8');
      ApiAction.Credentials = JSON.parse(cred);
    }
    else if (process.env.RBCAPI_CREDENTIALS) {
      // Use environment vars if available
      ApiAction.Credentials = JSON.parse(process.env.RBCAPI_CREDENTIALS);
    }
    else if (process.env.RBCAPI_CREDENTIALS_PATH) {
      // Use environment vars if available
      const cred = readFileSync(process.env.RBCAPI_CREDENTIALS_PATH, 'utf8');
      ApiAction.Credentials = JSON.parse(cred);
    }
    else {
      throw new Error('Cannot use RbcApi without credentials');
    }
    RbcStore.Options = ApiAction.Credentials.timezone;
  }
}

export { RbcStore } from './store';
export * from './types';
export { initBrowser } from './action';
