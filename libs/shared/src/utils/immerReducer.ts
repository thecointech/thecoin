import { ImmerReducer, createReducerFunction, createActionCreators, ImmerReducerClass, ActionCreators, isActionFrom, ImmerReducerFunction } from "immer-reducer";
import { put } from "redux-saga/effects";
import { Dictionary } from "lodash";
import { Reducer } from "redux";

class TheCoinReducer<T> extends ImmerReducer<T> {

  ///////////////////////////////////////////////////////////////////////////////////
  //
  // The following functions ease working with saga's
  updateWithValues(newState: T) {
    Object.assign(this.draftState, newState);
  }

  sendValues(command: any, values: any) {
    return put({
      type: command.type,
      payload: values
    });
  }

  actions(): any {
    throw ("This class should not be created directly")
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// GetNamedReducer: Build a reducer with a unique customName to allow immer-reducer-like usage
//  on named reducers.  This allows us to use a unique reducer on individual entries within
//  a dictionary, and/or use the same reducer multiple times.
//
type CacheEntry<T extends ImmerReducerClass>  = {
  dictionaryName?: string,
  reducer: Reducer, 
  actions: ActionCreators<T>,
  reducerClass: T
};

let reducerCache: Dictionary<CacheEntry<ImmerReducerClass>> = {};

export function GetReducer<T extends ImmerReducerClass>(immerReducerClass: T, initialState: any)
  : { reducer: ImmerReducerFunction<T>; actions: ActionCreators<T>; }
{
  return { 
    reducer: createReducerFunction(immerReducerClass, initialState),
    actions: createActionCreators(immerReducerClass),
  }
}

function CreateNamedReducer<T extends ImmerReducerClass>(immerReducerClass: T)
{
  class NamedReducer extends immerReducerClass {
    //static customName: string = name;
  };
  // We use Object.Assign to clone the prototype as we 
  // need to change the actions() function below and
  // need to ensure that change is local to the NamedReducer class
  Object.getOwnPropertyNames(immerReducerClass.prototype).forEach((key) => {
    if (key === "constructor") {
        return;
    }
    var method = immerReducerClass.prototype[key];
    if (typeof method !== "function") {
        return;
    }
    NamedReducer.prototype[key] = method;
  });
  return NamedReducer
}

function GetNamedReducer<T extends ImmerReducerClass>(immerReducerClass: T, name: string, initialState: any, dictionaryName?: string) : CacheEntry<T>
{
  if (!reducerCache[name]) {

    let namedReducer = CreateNamedReducer(immerReducerClass);
    const reducer = createReducerFunction(namedReducer, initialState) as any;
    const actionCreators = createActionCreators(namedReducer);

    // Redirect actions function to return appropriate data
    namedReducer.prototype.actions = () => actionCreators;

    reducerCache[name] = {
      reducer, 
      actions: actionCreators,
      reducerClass: namedReducer
    };
  }

  const r = reducerCache[name];
  // Because we may be called multiple times,
  // we allow post-fixing the dictionary name
  if (dictionaryName) {
    if (r.dictionaryName && r.dictionaryName != dictionaryName)
      console.error("WARNING: Mis-matched dictionary names being passed to GetNamedReducer");
    r.dictionaryName = dictionaryName;
  }
  return r as CacheEntry<T>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// buildNamedDictionaryReducer: Build a special reducer for a dictionary
//  This special-purpose reducer handles the case when there
//  is a named reducer for each entry in a dictionary of values
let dictionaryReducers: Dictionary<(state: Dictionary<any>|undefined, action: any) => Dictionary<any>> = {}
function buildNamedDictionaryReducer<T>(dictionaryFilter: string, initialState: Dictionary<T>) : Reducer<Dictionary<T>>
{
  // Don't recreate a new reducer for an existing dictionary.
  // Doing this can lose our existing state as the current
  // dictionary gets pushed out due to HMR
  let existing = dictionaryReducers[dictionaryFilter];
  if (!existing) {
    // Redirect reducer into named accounts
    existing = (state: Dictionary<T>|undefined, action: any) =>
    {
      if (!state)
        return initialState;

      let newState = state;
      Object.entries(reducerCache).forEach(
        ([name, value]) => {
          const { dictionaryName, reducer, reducerClass } = value;
          // We filter for only the entries who match this key
          if (dictionaryFilter !== dictionaryName)
            return;
            
          if (isActionFrom(action, reducerClass)) {
            // we manually pass through to the appropriate account
            let account = state[name];
            let newAccount = reducer(account, action);
            // Handle name change - remove original name and add under dictIndex
            let dictIndex = newAccount.name || name;
            const { [name]: _, ...omitted } = state;
            newState = {
              ...omitted,
              [dictIndex]: newAccount
            }
          }
        }
      );
      // Default state for a dictionary is always an empty dictionary
      return newState;
    }
    dictionaryReducers[dictionaryFilter] = existing;
  }
  return existing;
}

export { TheCoinReducer, buildNamedDictionaryReducer, GetNamedReducer }