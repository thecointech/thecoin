
import { functions, messages } from './index_common';
import { IpcRenderer } from '@thecointech/electron-utils/types/ipc';
import { log } from '@thecointech/logging';

//
// Electron-specific implementation of tx-gmail functions
// As googleapis does not function in render thread, all these
// functions simply send messages off to their partners in the
// node thread (we assume initialized at the start)
let _ipc: IpcRenderer | undefined = undefined;

function runf(name: string, ...args: any[]) {
  if (!_ipc) throw new Error("Initialize IPC");
  return _ipc.invoke(name, ...args);
}

const fns: functions = {

  bridge: async (ipc?: any) => {
    log.debug("Initializing tx-gmail IPC:invoke...");
    if (!ipc) throw new Error("Cannot initialize without IPC renderer")
    _ipc = ipc as IpcRenderer;
  },
  // No need to type these, at TS exports types from index_common
  initialize: (...args: any[]) => runf(messages.INITIALIZE, ...args),
  queryETransfers: (...args: any[]) => runf(messages.QUERY_ETRANSFERS, ...args),
  queryNewDepositEmails: (...args: any[]) => runf(messages.QUERY_ETRANSFERS, ...args),
  setETransferLabel: (...args: any[]) => runf(messages.QUERY_ETRANSFERS, ...args),
}
export default fns;
