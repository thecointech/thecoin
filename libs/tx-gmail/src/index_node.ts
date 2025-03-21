import { getAuthClient, isValid } from './auth';
import { initializeApi, setETransferLabel } from './fetch';
import { functions } from './index_common';
import { queryETransfers, queryNewDepositEmails } from './query';
import { getNewTokens } from './token';
import { log } from '@thecointech/logging';
import type { IpcMain } from '@thecointech/electron-utils/types/ipc';

const fns: functions = {
  bridge: (ipc) => { registerIpcListeners(ipc as IpcMain); },
  initialize: async (token) => {
    const auth = await getAuthClient();
    const credentials = getCredentials(token) ?? await getNewTokens(auth);
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

function getCredentials(token?: string) {
  if (token) {
    const credentials =  JSON.parse(token);
    return credentials;
    // if (credentials.expiry_date > Date.now()) {
    //   return credentials;
    // }
    // else {
    //   log.warn("Token expired, requesting new token");
    // }
  }
  return null;
}

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

