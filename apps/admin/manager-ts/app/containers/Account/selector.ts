import { ApplicationRootState } from "types";
import { initialState } from "./reducer";
import { ContainerState } from "./types";

function createAccountSelector(accountName: string) {
	return (state: ApplicationRootState) : ContainerState =>
		state.accounts ? state.accounts[accountName] || initialState : initialState;
}


export { createAccountSelector }