import { ApplicationBaseState } from "../../types";
import { AccountState, AccountMap, DefaultAccount } from "./types";
import { ReadAllAccounts } from "./storageSync";

function selectAccounts(state: ApplicationBaseState) : AccountMap {
	return state.accounts || ReadAllAccounts();
}

function createAccountSelector(accountName: string) {
	return (state: ApplicationBaseState) : AccountState => 
		selectAccounts(state).get(accountName) || {
			...DefaultAccount,
			name: accountName
		}
}


export { selectAccounts, createAccountSelector }