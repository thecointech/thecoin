import { getAllAccounts, getInitialAddress } from '@thecointech/account/store';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { log } from '@thecointech/logging';

export async function initAccounts() {
  log.trace('loading initial accounts');
  const map = await getAllAccounts();
  AccountMap.initialize({
    active: getInitialAddress(),
    map,
  })
}
