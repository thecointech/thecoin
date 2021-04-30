//
// All public-facing types are defined here.
//
// TODO: dedup with utilities
// TODO: convert to DateTime / Decimal for appropriate entries

import { CertifiedTransfer } from '@thecointech/types';
import { ProcessRecord } from '@thecointech/utilities/firestore';
import { Dictionary } from 'lodash';

// TODO: This project should encapsulate communication with/from firestore.

// All transaction types
export type BaseTransactionRecord = {
  transfer: {
    value: number
  }
  sourceId?: string; // A unique identifier of the source data
} & ProcessRecord;

export enum PurchaseType {
  etransfer = "etransfer",
  deposit = "deposit",
  other = "other",
}

export type DepositRecord = {
  type: PurchaseType; // One of eTransfer, directDeposit, other, etc
} & BaseTransactionRecord;

export type CertifiedTransferRecord = CertifiedTransfer & ProcessRecord;

// Note: these entries should match the UserActions above
export type DbRecords = {
  Buy: Dictionary<DepositRecord[]>,
  Sell: Dictionary<CertifiedTransferRecord[]>,
  Bill: Dictionary<CertifiedTransferRecord[]>,
}
