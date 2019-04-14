import { ApplicationRootState } from "types";
import { ImmerReducer, createReducerFunction, createActionCreators, ImmerReducerClass, ActionCreators } from "immer-reducer";
import { put } from "redux-saga/effects";

class TheCoinReducer<T> extends ImmerReducer<T> {
  
  //public _actions: any;
  //static customName: keyof ApplicationRootState;

  // Why is this function here?

  // constructor(a1, a2) {
  //   super(a1, a2);

  //   //this.customName = TName as string;
  //   // Jury rig up the actions entity so we can still call ourselves
    
  // }

  ///////////////////////////////////////////////////////////////////////////////////
  updateWithValues(newState: T) {
    Object.assign(this.draftState, newState);
  }

  sendValues(command, values) {
    return put({
      type: command.type,
      payload: values
    });
  }

  actions(): any {
    throw ("This class should not be created directly")
  }
}

var reducerCache = {};
// function GetNamedReducer<UState, UName extends keyof ApplicationRootState/*, ActionType extends ImmerReducerClass*/, T extends TheCoinReducer<UState, UName/*, ActionType*/>>(key: UName) {
//   const skey = key as string;
//   if (!reducerCache[skey]) {
//     var actionCreators = undefined;
//     //ExtendedReducer.customName = key;
//     //ExtendedReducer.prototype = AccountReducer.prototype;
//     const reducer = createReducerFunction(Reducer as unknown as ImmerReducerClass, initialState);
//     actionCreators = createActionCreators(Reducer as unknown as ImmerReducerClass);
//     reducerCache[skey] = [reducer, actionCreators, Reducer];
//   }
//   return reducerCache[skey]
// }

function GetNamedReducer<T extends ImmerReducerClass>(immerReducerClass: T, key: keyof ApplicationRootState, initialState) 
  : { reducer: any; actions: ActionCreators<T>; reducerClass: T }
{
  const skey = key as string;
  if (!reducerCache[skey]) {
    var actionCreators = undefined;
    
    // const extendedReducer: T & OverwriteName = immerReducerClass;
    immerReducerClass.customName = key;
    
    //ExtendedReducer.customName = key;
    //ExtendedReducer.prototype = AccountReducer.prototype;
    const reducer = createReducerFunction(immerReducerClass, initialState);
    actionCreators = createActionCreators(immerReducerClass);

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