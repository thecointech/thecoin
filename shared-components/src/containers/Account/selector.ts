import { ApplicationBaseState } from "../../types";
import { AccountState, AccountMap, DefaultAccount } from "./types";
import { ReadAllAccounts } from "./storageSync";
import { useSelector } from "react-redux";

export function accountSelector(state: ApplicationBaseState) : AccountMap {
	return state.accounts || ReadAllAccounts();
}

export const selectAccounts = () =>
    useSelector(accountSelector);

export const structuredSelectAccounts = (state: ApplicationBaseState) => ({
  accounts: accountSelector(state)
})

export const createAccountSelector = (accountName: string) => 
  (state: ApplicationBaseState) : AccountState => (
    accountSelector(state)[accountName] || {
			...DefaultAccount,
			name: accountName
		}
  )