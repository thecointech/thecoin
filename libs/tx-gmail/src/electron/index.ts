import type { TxGmailApi } from "./preload";

declare global {
  interface Window {
    txgmail: TxGmailApi
  }
}

export const initialize = (...args: Parameters<TxGmailApi['initialize']>) => window.txgmail.initialize(...args);
export const queryETransfers = (...args: Parameters<TxGmailApi['queryETransfers']>) => window.txgmail.queryETransfers(...args);
export const queryNewDepositEmails = (...args: Parameters<TxGmailApi['queryNewDepositEmails']>) => window.txgmail.queryNewDepositEmails(...args);
export const setETransferLabel = (...args: Parameters<TxGmailApi['setETransferLabel']>) => window.txgmail.setETransferLabel(...args);
