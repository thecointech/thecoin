import { getAuthClient, isValid } from './auth.js';
import { initializeApi, setETransferLabel } from './fetch.js';
import { functions } from './index_common.js';
import { queryETransfers, queryNewDepositEmails } from './query.js';
import { getNewTokens } from './token.js';
import { log } from '@thecointech/logging';
import type { IpcMain } from './electron_types';

const fns: functions = {
  bridge: (ipc) => { registerIpcListeners(ipc as IpcMain); },
  initialize: async (token) => {
    const auth = getAuthClient();
    const credentials = token ? JSON.parse(token) : await getNewTokens(auth);
    auth.setCredentials(credentials);

    if (!credentials || !isValid(auth)) {
      log.fatal(`Cannot run tx-gmail without auth: credentials ${JSON.stringify(credentials)}`)
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

function registerIpcListeners(ipc: IpcMain) {
  log.debug("Initializing tx-gmail IPC:handle...");
  // Listen for incoming requests
  ipc.handle("queryETransfers", async (_event, ...args: any[]) => {
    const r = await queryETransfers(...args);
    return r.map(e => ({
      ...e,
      cad: e.cad.toString(),
    }))
  });
  ipc.handle("queryNewDepositEmails", async (_event) => {
    const r = await queryNewDepositEmails();
    return r.map(e => ({
      ...e,
      cad: e.cad.toString(),
    }))
  });
  ipc.handle("initialize", async (_event, ...args: any[]) => {
    return await fns.initialize(...args);
  });
  // ipc.handle("setETransferLabel", async (_event, ...args: any[]) => {
  //   return await setETransferLabel(...args);
  // });
  // Object.keys(fns).forEach(key => {
  //   ipc.handle(
  //     key,
  //     (_event, ...args: any[]) => {
  //       const fn = (fns as any)[key];
  //       return fn(...args);
  //     }
  //   )
  // })
}

