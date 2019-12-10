import { initialState, IAccountsActions, AccountsState } from "./types"
import { Dispatch, bindActionCreators } from "redux";
import { ApplicationRootState } from "types";
import { TheCoinReducer, GetNamedReducer } from '@the-coin/components/utils/immerReducer'


const ACCOUNTS_KEY : keyof ApplicationRootState = "activeAccount";

class AccountsStateReducer extends TheCoinReducer<AccountsState> implements IAccountsActions {
    setActiveAccount(accountName: string) {
        this.draftState.activeAccount = accountName;
    }
}

export const { reducer, actions } = GetNamedReducer(AccountsStateReducer, ACCOUNTS_KEY, initialState);

export function DispatchAccounts(dispatch: Dispatch): IAccountsActions {
  return bindActionCreators(actions, dispatch) as IAccountsActions;
}
