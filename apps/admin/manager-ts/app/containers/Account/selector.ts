import { ApplicationRootState } from "types";
import { initialState } from "./reducer";
import { ContainerState } from "./types";

function createAccountSelector(accountName: keyof ApplicationRootState) {
	return (state: ApplicationRootState) : ContainerState =>
		state[accountName] || initialState;
}


export { createAccountSelector }