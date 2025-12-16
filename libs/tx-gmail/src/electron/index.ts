import type { TxGmailApi } from "./preload";

declare global {
  interface Window {
    txgmail: TxGmailApi
  }
}
function getTxGmailApi() {
  if (!window.txgmail) {
    throw new Error('txgmail API not available. Ensure Electron preload has executed.');
  }
  return window.txgmail;
}

export const initialize = (...args: Parameters<TxGmailApi['initialize']>) => getTxGmailApi().initialize(...args);
export const queryETransfers = (...args: Parameters<TxGmailApi['queryETransfers']>) => getTxGmailApi().queryETransfers(...args);
export const queryNewDepositEmails = (...args: Parameters<TxGmailApi['queryNewDepositEmails']>) => getTxGmailApi().queryNewDepositEmails(...args);
export const setETransferLabel = (...args: Parameters<TxGmailApi['setETransferLabel']>) => getTxGmailApi().setETransferLabel(...args);
