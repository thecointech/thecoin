import { AccountName, getSigner } from '@thecointech/signers';
import { buildNewAccount } from '@thecointech/account';
import { NormalizeAddress } from '@thecointech/utilities';
import { ConnectContract } from '@thecointech/contract-core';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { log } from '@thecointech/logging';
import { getComposeDB } from '@thecointech/idx';

async function buildMapEntry(name: AccountName) {
  const signer = await getSigner(name);
  const address = NormalizeAddress(await signer.getAddress());
  const account = buildNewAccount(name, address, signer);
  account.contract = await ConnectContract(signer);
  account.idx = await getComposeDB(signer);
  return { [address]: account };
}

export async function initialAccounts() {
  // open IPC bridge to node process.
  return {
    active: null,
    map: {
      // ...(await buildMapEntry("TheCoin")),
      ...(await buildMapEntry("BrokerCAD")),
    }
  }
}
export const initAccounts = async () => {
  log.debug('loading initial accounts');
  const initial = await initialAccounts();
  AccountMap.initialize(initial);
}
