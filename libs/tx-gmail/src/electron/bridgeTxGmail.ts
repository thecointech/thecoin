import { IpcMain } from "@thecointech/electron-utils/types/ipc";
import { queryETransfers, queryNewDepositEmails } from "../query";
import { log } from "@thecointech/logging";
import { initialize } from "../initialize";
import { messages } from "./types";

export function bridgeTxGmail(ipc: IpcMain) {
  log.debug("Initializing tx-gmail IPC:handle...");
  ipc.handle(messages.INITIALIZE, async (_event, ...args: any[]) => {
    return await initialize(...args);
  });
  // Listen for incoming requests
  ipc.handle(messages.QUERY_ETRANSFERS, async (_event, ...args: any[]) => {
    const r = await queryETransfers(...args);
    return r.map(e => ({
      ...e,
      cad: e.cad.toString(),
    }))
  });
  ipc.handle(messages.QUERY_NEW_DEPOSITS, async (_event) => {
    const r = await queryNewDepositEmails();
    return r.map(e => ({
      ...e,
      cad: e.cad.toString(),
    }))
  });
}

