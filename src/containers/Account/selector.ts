import { ApplicationBaseState } from "../../types";
import { AccountState, AccountMap, DefaultAccount } from "./types";
import { ReadAllAccounts } from "./storageSync";

function selectAccounts(state: ApplicationBaseState) : AccountMap {
	return state.accounts || ReadAllAccounts();
}

function structuredSelectAccounts(state: ApplicationBaseState) {
	return {
		accounts: selectAccounts(state)
	}
}

function createAccountSelector(accountName: string) {
	return (state: ApplicationBaseState) : AccountState => 
		selectAccounts(state)[accountName] || {
			...DefaultAccount,
			name: accountName
		}
}


export { selectAccounts, structuredSelectAccounts, createAccountSelector }