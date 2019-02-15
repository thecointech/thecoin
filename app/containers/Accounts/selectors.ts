/**
 * Homepage selectors
 */

import { createSelector, createStructuredSelector } from 'reselect';
import { initialState } from './reducer';
import { ApplicationRootState } from 'types';
import { ContainerState } from './types';

const selectAccounts = (state: ApplicationRootState) =>
  state.accounts ? state.accounts : initialState;

const selectActiveAccount = (state: ApplicationRootState) =>
   state.accounts ? state.accounts.activeAccount : initialState.activeAccount;

const makeSelectAllAccounts = () =>
  createSelector(selectAccounts, substate => substate.accounts);

const makeSelectActiveAccount = () =>
  createSelector(selectAccounts, substate => substate.activeAccount);

  // Map RootState to your StateProps
const mapStateToProps = createStructuredSelector<ApplicationRootState, ContainerState>({
  // All the keys and values are type-safe
  accounts: makeSelectAllAccounts(),
  activeAccount: makeSelectActiveAccount()
});

export { selectAccounts, selectActiveAccount, makeSelectActiveAccount, ContainerState, mapStateToProps };