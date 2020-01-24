import { select, put } from "redux-saga/effects";
import { ImmerReducerClass } from "immer-reducer";
import { TheCoinReducer } from "./immerReducer";

export function assertNever(result: never): never {
  throw new Error(`Invalid status result ${JSON.stringify(result)}.`);
}

export function buildSaga<T extends TheCoinReducer<any>>(reducer: ImmerReducerClass, selector: any, fnName: keyof T) {
  function* saga(action: any) {
    const state = yield select(selector);
    const reducerImp = new (reducer as any)(state, state);
    //@ts-ignore
    const fn = reducerImp[fnName].bind(reducerImp);
    if (Array.isArray(action.payload))
      yield* fn(...action.payload);
    else
      yield* fn(action.payload);
  }

  return saga;
}

// export function* buildSagas(actions: any, reducer: any, selector: any) {
//   for (let key in actions) {
//     if (actions[key].type) {
//       const saga = buildSaga(reducer, selector, key)
//       yield takeEvery(actions[key].type, saga);
//     }
//   }
// }

interface Action {
  type: string;
}
export function sendValues(command: Action, ...values: any[]) {
  return put({
    type: command.type,
    payload: values,
    args: true // extra info tells immer-reducer not to wrap our arguments in an array
  });
}