import { AccountMap, AccountMapState } from '@thecointech/shared/containers/AccountMap';
import { log } from '@thecointech/logging';

export async function initialAccounts(): Promise<AccountMapState> {
  // Always start empty, the App component loads an initial account
  return {
    active: null,
    map: {}
  }
}

export const initAccounts = async () => {
  log.debug('loading initial accounts');
  const initial = await initialAccounts();
  AccountMap.initialize(initial);
}
