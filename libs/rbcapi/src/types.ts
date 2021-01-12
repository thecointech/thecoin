import { DateTime } from "luxon";

export type Credentials = {
  password: string;
  cardNo: string;
  accountNo: string;

  pvq: {question: string, answer: string}[]
}

export type AuthOptions = Credentials|{
  authFile: string // A JSON file where credentials are stored
};

export const isCredentials = (options?: AuthOptions): options is Credentials =>
  !!(options as Credentials)?.password;

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
  // Custom error codes
  InvalidInput,
}

export type DepositResult = {
  message: string,
  code: ETransferErrorCode,
  confirmation?: number,
}

export type ProgressCallback = (v: string) => void;
