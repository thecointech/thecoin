import { useSelector } from "react-redux";
import { ApplicationRootState } from "types";
import { AccountMap } from "@the-coin/shared/containers/Account/types";

export const getDefaultAccount = (accounts: AccountMap) =>
  Object.keys(accounts)[0];

export const activeAccountSelector = (state: ApplicationRootState) =>
  state.accounts[
    state.activeAccount?.activeAccount
      ? state.activeAccount.activeAccount
      : getDefaultAccount(state.accounts)
  ] ?? null

export const selectActiveAccount = () =>
  useSelector(activeAccountSelector);