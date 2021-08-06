import type { IpcMain, IpcRenderer } from './electron_types';
import type { setETransferLabel } from './fetch';
import type { queryETransfers, queryNewDepositEmails } from './query';

export * from './types';

export type functions = {
  bridge: (ipc: IpcMain|IpcRenderer) => void;
  initialize: (token?: string) => Promise<string>;
  queryETransfers: typeof queryETransfers;
  queryNewDepositEmails: typeof queryNewDepositEmails;
  setETransferLabel: typeof setETransferLabel;
}

export const messages = {
  INITIALIZE_REQ: "initialize",
  INITIALIZE_RESP: "initialize-resp",
  QUERY_ETRANSFERS_REQ: "queryETransfers",
  QUERY_ETRANSFERS_RESP: "queryETransfers-resp",
  QUERY_NEW_DEPOSITS_REQ: "queryNewDepositEmails",
  QUERY_NEW_DEPOSITS_RESP: "queryNewDepositEmails-resp",

  SET_LABEL_REQ: "setLabel",
  SET_LABEL_RESP: "setLabel-resp",
}

export type { Labels } from './fetch'

// Fake export to satisfy TS importing
export default {} as functions;
