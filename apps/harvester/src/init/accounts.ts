import { AccountMap, AccountMapState } from '@thecointech/shared/containers/AccountMap';
import { log } from '@thecointech/logging';
import { bridgeBrowser } from '@thecointech/electron-signer';

export async function initialAccounts(): Promise<AccountMapState> {
  // // open IPC bridge to node process.
  // const existing = await window.scraper.getCoinAccountDetails();
  // if (existing.value?.address) {
  //   // const account = Account(existing.value.address);

  //   const signer = new ElectronSigner(existing.value.address);
  //   const account = buildNewAccount(existing.value.name, existing.value.address, signer);

  //   return {
  //     active: existing.value.address,
  //     map: {
  //       [existing.value.address]: account,
  //     }
  //   }
  // }
  // else {
    return {
      active: null,
      map: {}
    }
  // }
}
export const initAccounts = async () => {
  log.debug('loading initial accounts');
  const initial = await initialAccounts();
  AccountMap.initialize(initial);

  bridgeBrowser();
}
