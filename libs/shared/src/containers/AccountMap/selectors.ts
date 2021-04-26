import { useSelector } from "react-redux";
import { AccountMapStore } from './types';

// Select array of all accounts
export const selectAccountArray = (state: AccountMapStore) =>
  Object.values(state.accounts.map)

export const useAccountStore = () =>
  useSelector((state: AccountMapStore) => ({
    accounts: selectAccountArray(state as AccountMapStore),
    active: state.accounts.active
  }));


// Select the active account
export const activeAccountSelector = (state: AccountMapStore) => {
  const { active } = state.accounts;

  if (active && state.accounts.map[active])
    return state.accounts.map[active];

  // If we have no active account, just return the first one.
  return selectAccountArray(state)[0];
}

export const useActiveAccount = () =>
  useSelector(activeAccountSelector);
