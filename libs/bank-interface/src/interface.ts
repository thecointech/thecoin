import { DepositResult, ProgressCallback, BankTx } from './types';
import { ETransferPacket } from '@thecointech/types';

export interface IBank {

  //
  // Attempt to deposit eTransfer from url
  depositETransfer(prefix: string, url: string, code: string, progressCb: ProgressCallback): Promise < DepositResult >;

  //
  // Get most recent transactions posted.
  // Will get todays transactions
  fetchLatestTransactions(): Promise<Array<BankTx>>;

  //
  // Download historical transactions
  // May exclude todays transactions
  getTransactions(from: Date, to?: Date, accountNo?: string): Promise<BankTx[]>;

  // send an eTransfer to email in Packet
  sendETransfer(prefix: string, amount: number, name: string, packet: ETransferPacket, progressCb: ProgressCallback): Promise<number>;
}
