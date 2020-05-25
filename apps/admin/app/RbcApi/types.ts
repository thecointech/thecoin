import { DateTime } from "luxon";

export type RbcTransaction = {
  AccountType: string;
  AccountNumber: string;
  TransactionDate: DateTime;
  ChequeNumber?: number;
  Description1?: string;
  Description2?: string;
  CAD?: number;
  USD?: number;
}

export enum ETransferErrorCode {
  UnknownError = -1,
  Success = 0,
  AlreadyDeposited = 2,
  Cancelled = 38,
}

export type DepositResult = {
  message: string,
  code: ETransferErrorCode,
}

export type ProgressCallback = (v: string) => void;
