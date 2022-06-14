import type { AccountState } from '@thecointech/account';
import type { AccountMapStore } from './types';

// Select array of all accounts
export const selectAccountArray = (state: AccountMapStore) =>
  Object.values<AccountState>(state.accounts.map)

// Select the active account
export const activeAccountSelector = (state: AccountMapStore) : AccountState|undefined => {
  const { active } = state.accounts;

  if (active && state.accounts.map[active])
    return state.accounts.map[active];

  // If we have no active account, just return the first one.
  return selectAccountArray(state)[0];
}
