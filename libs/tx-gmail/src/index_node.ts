import { getAuthClient, isValid } from './auth';
import { initializeApi, setETransferLabel } from './fetch';
import type { IpcMain } from './electron_types';
import { functions, messages } from './index_common';
import { queryETransfers, queryNewDepositEmails } from './query';
import { getNewTokens } from './token';
import { log } from '@thecointech/logging';

const fns: functions = {
  bridge: (ipc) => { registerIpcListeners(ipc as IpcMain); },
  initialize: async (token) => {
    const auth = getAuthClient();
    const credentials = token ? JSON.parse(token) : await getNewTokens(auth);
    auth.setCredentials(credentials);

    if (!credentials || !isValid(auth)) {
      log.fatal(`Cannot run tx-gmail without auth: credentials ${credentials}`)
      throw new Error("NoAuth");
    }

    await initializeApi(auth);
    return JSON.stringify(credentials);
  },
  queryETransfers,
  queryNewDepositEmails,
  setETransferLabel,
}

export default fns;

let _ipc = null;
function registerIpcListeners(ipc: IpcMain) {
  _ipc = ipc;
  // Listen for incoming requests
  _ipc.on(messages.INITIALIZE_REQ, async (event, token) => {
    const r = await fns.initialize(token)
    event.sender.send(messages.QUERY_ETRANSFERS_RESP, r);
  });
  _ipc.on(messages.QUERY_ETRANSFERS_REQ, async (event, query) => {
    const r = await queryETransfers(query)
    event.sender.send(messages.QUERY_ETRANSFERS_RESP, JSON.stringify(r));
  });
  _ipc.on(messages.QUERY_NEW_DEPOSITS_REQ, async (event) => {
    const r = await queryNewDepositEmails()
    event.sender.send(messages.QUERY_ETRANSFERS_RESP, JSON.stringify(r));
  })
}

// namespace TxGmail {
//   export async function initialize(ipc?: IpcMain) {
//     // First, connect and fetch new deposit emails.
//     const auth = await authorize(getCode);
//     if (!isValid(auth))
//       throw new Error("Cannot run service without auth.  Please login from the UI first");

//     await initializeApi(auth);

//     if (ipc) {
//       registerIpcListeners(ipc);
//     }


// }


