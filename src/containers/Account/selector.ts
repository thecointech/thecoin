import { ApplicationRootState } from "../../types";
import { initialState } from "./reducer";
import { ContainerState } from "./types";

function createAccountSelector(accountName: string) {
	return (state: ApplicationRootState) : ContainerState =>
		state.accounts[accountName] || initialState;
}


export { createAccountSelector }