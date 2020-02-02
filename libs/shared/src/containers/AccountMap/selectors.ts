import { useSelector } from "react-redux";
import { AccountState } from "../Account/types";
import { ApplicationBaseState } from "../../types";

// Select the whole thing
export const selectAccounts = (state: ApplicationBaseState) => 
  state.accounts;
export const useAccounts = () =>
  useSelector(selectAccounts);


// Select account map
export const selectAccountMap = (state: ApplicationBaseState) => 
  selectAccounts(state).map;
export const useAccountMap = () => 
  useSelector(selectAccountMap);

// Select specific account
export const useAccount = (address:  string) : AccountState|undefined =>
  useAccountMap()[address]

// export const getDefaultAccount = (accounts: AccountDict) =>
//   Object.keys(accounts)[0];

// Select the active account
export const activeAccountSelector = (state: ApplicationBaseState) => {
  const {map, active} = state.accounts;
  
  if (active && map[active])
    return map[active];

  // If we have no active account, just return the first one.
  const allAccounts = Object.values(map);
  return allAccounts[0];
}

export const useActiveAccount = () =>
  useSelector(activeAccountSelector);