//
// All public-facing types are defined here.
//
// TODO: dedup with utilities
// TODO: convert to DateTime / Decimal for appropriate entries

import { CertifiedTransfer } from '@the-coin/types';
import { ProcessRecord } from '@the-coin/utilities/firestore';

export type UserAction = "Buy"|"Sell"|"Bill";

// TODO: This project should encapsulate communication with/from firestore.

// All transaction types
export type BaseTransactionRecord = {
  transfer: {
    value: number
  }
} & ProcessRecord;

export enum PurchaseType {
  etransfer = "etransfer",
  deposit = "deposit",
  other = "other",
}

export type DepositRecord = {
  type: PurchaseType; // One of eTransfer, directDeposit, other, etc
  sourceId?: string; // A unique identifier of the source data
} & BaseTransactionRecord;

export type CertifiedTransferRecord = CertifiedTransfer & ProcessRecord;
