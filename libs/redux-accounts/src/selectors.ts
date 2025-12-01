import type { AccountState } from '@thecointech/account';
import type { AccountMapStore } from './types';
import { createSelector } from 'reselect';

// Select the accounts map
const selectAccountsMap = (state: AccountMapStore) => state.accounts.map;

// Select array of all accounts - memoized to prevent unnecessary re-renders
export const selectAccountArray = createSelector(
  [selectAccountsMap],
  (accountsMap) => Object.values<AccountState>(accountsMap)
);

// Select the active account
export const activeAccountSelector = (state: AccountMapStore) : AccountState|undefined => {
  const { active } = state.accounts;

  if (active && state.accounts.map[active])
    return state.accounts.map[active];

  // If we have no active account, just return the first one.
  return selectAccountArray(state)[0];
}
