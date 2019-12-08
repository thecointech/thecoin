import { initialState, IAccountsActions, AccountsState } from "./types"
import { Dispatch, bindActionCreators } from "redux";
import { ApplicationRootState } from "types";
import { TheCoinReducer, GetNamedReducer } from '@the-coin/components/utils/immerReducer'
import injectReducer from '@the-coin/components/utils/injectReducer';
import { buildRootReducer as buildAccountsReducer } from '@the-coin/components/containers/Account/reducer';
import { compose } from 'redux';

const ACCOUNTS_KEY : keyof ApplicationRootState = "content";

class AccountsStateReducer extends TheCoinReducer<AccountsState> implements IAccountsActions {
    setActiveAccount(accountName: string) {
        this.draftState.activeAccount = accountName;
    }
}

const { reducer, actions } = GetNamedReducer(AccountsStateReducer, ACCOUNTS_KEY, initialState);

export function buildReducer<T>() {

  const rootReducer = buildAccountsReducer<T>();

  const activeReducer = injectReducer<T>({
    key: ACCOUNTS_KEY,
    reducer: reducer
  });

  return compose(rootReducer, activeReducer)
}

export function DispatchAccounts(dispatch: Dispatch): IAccountsActions {
  return bindActionCreators(actions, dispatch) as IAccountsActions;
}
