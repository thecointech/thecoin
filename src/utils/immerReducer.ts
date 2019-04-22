import { ApplicationRootState } from "types";
import { ImmerReducer, createReducerFunction, createActionCreators, ImmerReducerClass, ActionCreators } from "immer-reducer";
import { put } from "redux-saga/effects";

class TheCoinReducer<T> extends ImmerReducer<T> {
  
  ///////////////////////////////////////////////////////////////////////////////////
  updateWithValues(newState: T) {
    Object.assign(this.draftState, newState);
  }

  sendValues(command: any, values: Object) {
    return put({
      type: command.type,
      payload: values
    });
  }

  actions(): any {
    throw ("This class should not be created directly")
  }
}

interface ReducerCache {
  [key: string]: {
    reducer: any,
    actions: any,
    reducerClass: any
  }
}
var reducerCache: ReducerCache = {};

function GetNamedReducer<T extends ImmerReducerClass>(immerReducerClass: T, key: keyof ApplicationRootState, initialState: any) 
  : { reducer: any; actions: ActionCreators<T>; reducerClass: T }
{
  const skey = key as string;
  if (!reducerCache[skey]) {
    
    immerReducerClass.customName = key;

    const reducer = createReducerFunction(immerReducerClass, initialState);
    const actionCreators = createActionCreators(immerReducerClass);

    // Redirect actions function to return appropriate data
    immerReducerClass.prototype.actions = () => actionCreators;

    reducerCache[skey] = {
      reducer, 
      actions: actionCreators,
      reducerClass: immerReducerClass
    };
  }
  
  return reducerCache[skey];
}


export { TheCoinReducer, GetNamedReducer }