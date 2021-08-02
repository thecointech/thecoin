import { getAllAccounts, getInitialAddress } from '@thecointech/account/store';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { log } from '@thecointech/logging';

export function initAccounts() {
  log.trace('loading initial accounts');
  AccountMap.initialize({
    active: getInitialAddress(),
    map: getAllAccounts()
  })
}
