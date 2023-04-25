import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { log } from '@thecointech/logging';

// declare let window: Window & {
//   ipcRenderer: Pick<IpcRenderer, "invoke">
// };

// async function buildMapEntry(name: AccountName) {
//   const signer = await getSigner(name);
//   const address = NormalizeAddress(await signer.getAddress());
//   const account = buildNewAccount(name, address, signer);
//   account.contract = await ConnectContract(signer);
//   account.idx = await connectIDX(signer);
//   return { [address]: account };
// }

export async function initialAccounts() {
  // open IPC bridge to node process.
  return {
    active: null,
    map: {}
  }
}
export const initAccounts = async () => {
  log.debug('loading initial accounts');
  // bridge(window.ipcRenderer);
  const initial = await initialAccounts();
  AccountMap.initialize(initial);
}
