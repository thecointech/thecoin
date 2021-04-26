import { IsValidAddress } from "@thecointech/utilities";
import { ReducersMapObject, AnyAction, Reducer } from "redux";
import { AccountMap, AccountMapState } from ".";

export const mappedReducer = (accountMapReducer: Reducer, accountReducers: ReducersMapObject) => {
  const accountKeys = Object.keys(accountReducers);

  // Reducer is almost identical to combineReducer, but does not
  // do invalid key checking (which is not applicable to us)
  const combinedReducer = (prevMap: AccountMap, action: AnyAction) => {
    const nextMap: AccountMap = {
      ...prevMap,
    };
    let changed = false;
    for (let i = 0; i < accountKeys.length; i++) {
      const key = accountKeys[i];
      const prevState = prevMap[key];
      const nextState = accountReducers[key](prevState, action);
      nextMap[key] = nextState;
      changed = changed || (nextState != prevState);
    }
    return changed ? nextMap : prevMap;
  }

  // Cross-slicing reducer function. Allows both AccountMap reducer
  // and actual accounts to operate on the data in accounts.map
  return (state: AccountMapState, action: AnyAction) => {

    // First, run on account map
    const nextState = accountMapReducer(state, action);
    if (nextState != state)
      return nextState;

    // next, run on each account reducer in turn
    const nextMap = combinedReducer(state.map, action);
    return (nextMap == state.map)
      ? state
      : {
        ...state,
        map: nextMap,
      }
  }
}

export function splitAccountFromRest(injectedReducers?: ReducersMapObject) {
  let rest: ReducersMapObject = {};
  const accounts: ReducersMapObject = {};
  if (injectedReducers) {
    Object.entries(injectedReducers)
      .forEach(([key, value]) => (IsValidAddress(key) ? accounts : rest)[key] = value);
  }
  return { accounts, rest };
}
