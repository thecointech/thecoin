import { RbcTransaction, ProgressCallback } from './types';
import { getTransactions, fetchLatestTransactions } from './transactions';
import { depositETransfer } from './deposit';
import credentials from './credentials.json';
import { ETransferPacket } from '@the-coin/types';
import { send } from './etransfer';
import { log } from 'logging';

export class RbcApi {

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

  static ApiTimeZone = credentials.TimeZone;
}

export * from './types';
