
// import { functions, messages } from './index_common';
// import { IpcRenderer } from './electron_types';
// import { eTransferData } from './types';
import { log } from '@thecointech/logging';

log.debug("Loading TxGmail: Electron");
// //
// // Electron-specific implementation of tx-gmail functions
// // As googleapis does not function in render thread, all these
// // functions simply send messages off to their partners in the
// // node thread (we assume initialized at the start)
// let _ipc: IpcRenderer | undefined = undefined;

// const fns: functions = {

//   bridge: async (ipc?) => {
//     log.debug("Initiating bridge in Renderer")
//     if (!ipc) throw new Error("Cannot initialize without IPC renderer")
//     _ipc = ipc as IpcRenderer;
//   },

//   initialize: (token) => {
//     const ipc = _ipc;
//     if (!ipc) throw new Error("Initialize IPC");
//     return new Promise((resolve, reject) => {
//       ipc.send(messages.INITIALIZE_REQ, token);
//       ipc.on(messages.INITIALIZE_RESP, (_event, data: string) => {
//         if (data) resolve(data);
//         else reject("No data fetched");
//       })
//     })
//   },
//   queryETransfers: async (query?) => {
//     const ipc = _ipc;
//     if (!ipc) throw new Error("Initialize IPC");
//     return new Promise((resolve, reject) => {
//       ipc.send(messages.QUERY_ETRANSFERS_REQ, query);
//       ipc.on(messages.QUERY_ETRANSFERS_RESP, (_event, data: string) => {
//         if (data) resolve(JSON.parse(data) as eTransferData[]);
//         else reject("No data fetched");
//       })
//     })
//   },
//   queryNewDepositEmails: async () => {
//     const ipc = _ipc;
//     if (!ipc) throw new Error("Initialize IPC");
//     return new Promise((resolve, reject) => {
//       ipc.send(messages.QUERY_NEW_DEPOSITS_REQ);
//       ipc.on(messages.QUERY_NEW_DEPOSITS_RESP, (_event, data: string) => {
//         if (data) resolve(JSON.parse(data) as eTransferData[]);
//         else reject("No data fetched");
//       })
//     })
//   }
// }
export default {};
