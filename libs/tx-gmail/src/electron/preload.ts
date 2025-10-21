import { contextBridge, ipcRenderer } from "electron";
import { messages } from "./types";
import type { initialize as initializeType } from "../initialize";
import type { queryETransfers as queryETransfersType } from "../query";
import type { queryNewDepositEmails as queryNewDepositEmailsType } from "../query";
import type { setETransferLabel as setETransferLabelType } from "../fetch";

const api = {
  initialize: ((...args: any[]) => ipcRenderer.invoke(messages.INITIALIZE, ...args)) as typeof initializeType,
  queryETransfers: ((...args: any[]) => ipcRenderer.invoke(messages.QUERY_ETRANSFERS, ...args)) as typeof queryETransfersType,
  queryNewDepositEmails: ((...args: any[]) => ipcRenderer.invoke(messages.QUERY_NEW_DEPOSITS, ...args)) as typeof queryNewDepositEmailsType,
  setETransferLabel: ((...args: any[]) => ipcRenderer.invoke(messages.SET_LABEL, ...args)) as typeof setETransferLabelType,
}

export type TxGmailApi = typeof api;

export function preloadTxGmail() {
  // Expose protected methods that allow the renderer process to use
  // the ipcRenderer without exposing the entire object
  contextBridge.exposeInMainWorld("txgmail", api);
}
