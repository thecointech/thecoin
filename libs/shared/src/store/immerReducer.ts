import { ImmerReducer,  createReducerFunction, createActionCreators, ImmerReducerClass, ImmerReducerState } from "immer-reducer";
import { put } from "redux-saga/effects";
import { Reducer } from "redux";

interface Action {
  type: string;
}

export abstract class TheCoinReducer<T> extends ImmerReducer<T> {

  ///////////////////////////////////////////////////////////////////////////////////
  //
  // The following functions ease working with saga's

  sendValues(command: Action, values?: any) {
    return put({
      type: command.type,
      payload: values
    });
  }

  storeValues(values: Partial<T>) {
    // deepcode ignore UsageOfUndefinedReturnValue: This actually works with the crazy creation code below
    return this.sendValues(this.actions().updateWithValues, values)
  }

  updateWithValues(newState: Partial<T>) {
    Object.assign(this.draftState, newState);
  }

  actions() : any {
    debugger;
    throw ("This class should not be created directly")
  }

  static buildReducers<T extends ImmerReducerClass>(klass: T, initialState:  ImmerReducerState<T>) {
    const reducer: Reducer = createReducerFunction(klass, initialState) as unknown as any;
    const actions = createActionCreators(klass);
    (klass as any).prototype.actions = () => actions;
    return { reducer, actions };
  }

  // static buildSaga(reducer: any, selector: any, fnName: string) {
  //   function* saga(action: any) {
  //     const state = yield select(selector);
  //     const reducerImp = new reducer(state, state);
  //     //@ts-ignore
  //     const fn = reducerImp[fnName].bind(reducerImp);
  //     if (Array.isArray(action.payload))
  //       yield* fn(...action.payload);
  //     else
  //       yield* fn(action.payload);
  //   }
  //   return saga;
  // }

  // static function* buildSagas(reducer: any, selector: any) {
  //   const actions = actions();
  //   for (let key in actions) {
  //     if (actions[key].type) {
  //       const saga = buildSaga(reducer, selector, key)
  //       yield takeEvery(actions[key].type, saga);
  //     }
  //   }
  // }

}
