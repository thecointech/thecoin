import { AccountName, getSigner } from '@thecointech/signers';
import { buildNewAccount } from '@thecointech/account';
import { NormalizeAddress } from '@thecointech/utilities';
import { ConnectContract } from '@thecointech/contract';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { log } from '@thecointech/logging';

async function buildMapEntry(name: AccountName) {
  const signer = await getSigner(name);
  const contract = ConnectContract(signer);
  const address =  NormalizeAddress(await signer.getAddress());
  const account = buildNewAccount(name, address, signer);
  account.contract = contract;
  return { [address]: account };
}

export async function initialAccounts() {
  log.debug('loading initial accounts');
  return {
    active: null,
    map: {
      ...(await buildMapEntry("TheCoin")),
      ...(await buildMapEntry("BrokerCAD")),
    }
  }
}
const initial = await initialAccounts();
export const initAccounts = () => AccountMap.initialize(initial);
