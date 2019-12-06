import { useSelector } from "react-redux";
import { ApplicationRootState } from "types";
import { initialState } from "./types";

export const activeAccountSelector = (state: ApplicationRootState) => state.activeAccount || initialState;

export function SelectActiveAccount() {
    return useSelector(activeAccountSelector).activeAccount;
}
