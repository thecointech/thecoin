import { RbcTransaction } from './types';
import { getTransactions, fetchLatestTransactions } from './transactions';
import { depositETransfer } from './deposit';

export class RbcApi {

  depositETransfer = (prefix: string, url: string, code: string, progressCb: (v: string) => void) =>  depositETransfer(prefix, url, code, progressCb);

  fetchLatestTransactions = () => fetchLatestTransactions();

  getTransactions = (from: Date, to: Date) : Promise<RbcTransaction[]> => getTransactions(from, to);
}

export * from './types';