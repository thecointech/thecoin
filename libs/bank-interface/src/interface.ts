import type { DepositResult, ProgressCallback, BankTx } from './types';
import type { ETransferPacket } from '@thecointech/types';
import type { Decimal } from 'decimal.js-light';
export interface IBank {

  getBalance(): Promise<number>;

  //
  // Attempt to deposit eTransfer from url
  depositETransfer(prefix: string, url: string, code: string, progressCb: ProgressCallback): Promise < DepositResult >;

  //
  // Make a bill payment for the person
  payBill(prefix: string, name: string, payee: string, accountNo: string, amount: Decimal, progressCb?: ProgressCallback): Promise<string>;

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
