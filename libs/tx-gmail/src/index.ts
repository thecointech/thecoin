// import { setETransferLabel } from './fetch';
// import { functions } from './index_common';
// import { queryETransfers, queryNewDepositEmails } from './query';
// import type { IpcMain } from '@thecointech/electron-utils/types/ipc';
// import { initialize } from './initialize';

// const fns: functions = {
//   bridge: (ipc) => { registerIpcListeners(ipc as IpcMain); },
//   initialize,
//   queryETransfers,
//   queryNewDepositEmails,
//   setETransferLabel,
// }


export { initialize } from './initialize';
export { queryETransfers, queryNewDepositEmails } from './query';
export { setETransferLabel, type Labels } from './fetch';
export type { eTransferData } from './types';
