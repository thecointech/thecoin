
export type RbcTransaction = {
  AccountType: string;
  AccountNumber: string;
  TransactionDate: Date;
  ChequeNumber?: number;
  Description1: string;
  Description2: string;
  CAD?: number;
  USD?: number;
}
