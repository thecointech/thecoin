import type { TxGmailApi } from "./preload";

declare global {
  interface Window {
    txgmail: TxGmailApi
  }
}

export const initialize = window.txgmail.initialize;
export const queryETransfers = window.txgmail.queryETransfers;
export const queryNewDepositEmails = window.txgmail.queryNewDepositEmails;
export const setETransferLabel = window.txgmail.setETransferLabel;
