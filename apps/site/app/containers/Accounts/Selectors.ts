import { useSelector } from "react-redux";
import { ApplicationRootState } from "types";
import { AccountMap } from "@the-coin/shared/containers/Account/types";

export const getDefaultAccount = (accounts: AccountMap) =>
  Object.keys(accounts)[0];
  
export const activeAccountSelector = (state: ApplicationRootState) =>
  state.activeAccount?.activeAccount || getDefaultAccount(state.accounts)

export const selectActiveAccount = () =>
    useSelector(activeAccountSelector);