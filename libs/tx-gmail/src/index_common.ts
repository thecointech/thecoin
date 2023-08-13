import type { IpcMain, IpcRenderer } from '@thecointech/electron-utils/types/ipc';
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
  INITIALIZE: "initialize",
  QUERY_ETRANSFERS: "queryETransfers",
  QUERY_NEW_DEPOSITS: "queryNewDepositEmails",
  SET_LABEL: "setLabel",
}

export type { Labels } from './fetch'

// Fake export to satisfy TS importing
export default {} as functions;
