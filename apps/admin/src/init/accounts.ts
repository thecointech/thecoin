import { AccountName, getSigner } from '@thecointech/signers';
import { buildNewAccount } from '@thecointech/account';
import { NormalizeAddress } from '@thecointech/utilities';
import { ConnectContract } from 'contract-core';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { log } from '@thecointech/logging';
import { bridge } from '@thecointech/signers/electron';
import type { IpcRenderer } from 'electron';

declare let window: Window & {
  ipcRenderer: Pick<IpcRenderer, "invoke">
};

async function buildMapEntry(name: AccountName) {
  const signer = await getSigner(name);
  const contract = ConnectContract(signer);
  const address =  NormalizeAddress(await signer.getAddress());
  const account = buildNewAccount(name, address, signer);
  account.contract = contract;
  return { [address]: account };
}

export async function initialAccounts() {
  // open IPC bridge to node process.
  return {
    active: null,
    map: {
      ...(await buildMapEntry("TheCoin")),
      ...(await buildMapEntry("BrokerCAD")),
    }
  }
}
export const initAccounts = async () => {
  log.debug('loading initial accounts');
  bridge(window.ipcRenderer);
  const initial = await initialAccounts();
  AccountMap.initialize(initial);
}
