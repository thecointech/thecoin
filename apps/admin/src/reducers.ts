/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers, Reducer, ReducersMapObject } from 'redux';
import { connectRouter } from 'connected-react-router';
import { configureStore, history } from '@thecointech/shared/store';
import { buildAccountStoreReducer } from '@thecointech/shared/containers/AccountMap';
import { getSigner } from '@thecointech/signers';
import { buildNewAccount } from '@thecointech/account';
import { NormalizeAddress } from '@thecointech/utilities';

async function initialAccounts() {
  console.log('loading initial accounts');
  const brokerCad = await getSigner("BrokerCAD");
  const theCoin = await getSigner("TheCoin");
  const brokerCadAddr = NormalizeAddress(await brokerCad.getAddress());
  const theCoinAddr = NormalizeAddress(await theCoin.getAddress());

  return {
    active: null,
    map: {
      [theCoinAddr]: buildNewAccount("TheCoin", theCoinAddr, theCoin),
      [brokerCadAddr]: buildNewAccount("BrokerCAD", brokerCadAddr, theCoin),
    }
  }
}

const initial = await initialAccounts();

/**
 * Merges the main reducer with the router state and dynamically injected reducers
 */
 function createReducer(injectedReducers?: ReducersMapObject): Reducer {
  // TODO: add the appropriate accounts from .env accounts
  const { accountStoreReducer, rest } = buildAccountStoreReducer(injectedReducers, initial);
  return combineReducers({
    router: connectRouter(history) as Reducer,
    accounts: accountStoreReducer,
    ...rest,
  });
}


export { history };
export const configureAdminStore = () => configureStore(createReducer);
