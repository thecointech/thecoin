import { ImmerReducer, createReducerFunction, createActionCreators, ImmerReducerClass, ImmerReducerState } from "immer-reducer";
import { put, select, SelectEffect, takeLatest } from "@redux-saga/core/effects";
import { Action, bindActionCreators, Reducer } from "redux";
import { useDispatch, useSelector } from 'react-redux';
import { useInjectReducer, useInjectSaga } from 'redux-injectors';
import type { Saga } from '@redux-saga/core';

//
// Duplicating the ActionsType from ImmerReducer.  This
// is unfortunately necessary because the package version
// requires the input to be a class (and we can only provide an interface)
type FirstOrAll<T> = T extends [infer V] ? V : T;
type ArgumentsType<T> = T extends (...args: infer V) => any ? V : never;
export interface ImmerActionCreator<ActionTypeType, Payload extends any[]> {
  readonly type: ActionTypeType;
  (...args: Payload): {
      type: ActionTypeType;
      payload: FirstOrAll<Payload>;
  };
}

export type ActionsType<Interface> = {
  [K in keyof Interface] : ImmerActionCreator<K, ArgumentsType<Interface[K]>>
}

export function BaseReducer<U, T>(key: string, initialState: T) {
  // Return new class so we can re-use the static declarations
  const BaseReducer = class BaseReducer extends ImmerReducer<T> {

    static _reducer: any;
    static _actions: any;

    public get actions(): ActionsType<U> { return BaseReducer._actions; }
    public get reducer(): Reducer { return BaseReducer._reducer; }

    static buildReducers<K extends ImmerReducerClass>(klass: K, initialState: ImmerReducerState<K>) {
      BaseReducer._reducer = createReducerFunction(klass, initialState);
      BaseReducer._actions = createActionCreators(klass);
    }
  }

  // We can't define static functions with generics,
  // So we create a new type here separate from the
  // class and then just directly set it's members for faux-statics
  type InjectedStatics = {
    // Initialize the store ready for use (inject reducers/sagas etc)
    useStore: () => void,
    // Return the API for interacting with this store
    useApi:() => U,
    // Return the data held by this store.
    useData: () => T,
    // Init to a particular state
    initialize: (state?: Partial<T>, derived?: any) => void,
    actions: ActionsType<U>,
    reducer: Reducer,
    // Selector selects this reducers data from app store
    selector: (state: any) => T,
    // Capture a pointer to the derived class here.
    // We can't type it properly so don't even try
    derived: any,
  }

  // Directly set function implementations
  const r: typeof BaseReducer&InjectedStatics = BaseReducer as any;
  r.initialize = function(state) {
    // We -want- to shadow the outer value.  By defining this fn using () =>
    // we pick up the pointer to the final implementation, rather than the base
    r.derived = this;
    BaseReducer.buildReducers(r.derived, {
      ...initialState,
      ...state
    });
    r.actions = BaseReducer._actions;
    r.reducer = BaseReducer._reducer;
  }
  r.useStore = function() {
    // Default init takes care of circumstances where
    // there is no need for explicit initialization
    if (!BaseReducer._reducer) r.initialize.call(this);
    useInjectReducer({ key, reducer: BaseReducer._reducer });
  }
  r.useApi = () => bindActionCreators(BaseReducer._actions, useDispatch());
  r.useData = () => useSelector(r.derived.selector);
  r.selector = (state) => state[key] || initialState;

  return r;
}

////////////////////////////////////////////////////////////////////////////////////////////////////

export type SagaInterface<IActions, State> = {
  derived: new (...args: any[]) => IActions;
  actions: ActionsType<IActions>;
  selector: (state: any) => State|undefined;
}
export type SagaBuilder<IActions, State> = (reducer: SagaInterface<IActions, State>) => Saga<any[]>;


export function buildSaga<IActions, State>(sagaReducer: SagaInterface<IActions, State>, fnName: keyof IActions) {
  function* saga(action: any) : Generator<SelectEffect, void> {
    const state = yield select(sagaReducer.selector);
    const reducerImp = new sagaReducer.derived(state, state);
    //@ts-ignore
    const fn = reducerImp[fnName].bind(reducerImp);
    if (Array.isArray(action.payload))
      yield* fn(...action.payload);
    else
      yield* fn(action.payload);
  }

  return saga;
}

// For saga-based reducers we add a simple 'store'
// action.  This gives an easy way for any client to update
// the store from async code.
export interface BaseSagaInterface<T> {
  updateWithValues(newState: Partial<T>) : void;
}

export function SagaReducer<U, T>(key: string, initialState: T, sagas: SagaBuilder<U, T>|(keyof U)[]) {
  const Super = BaseReducer<U&BaseSagaInterface<T>, T>(key, initialState);
  const SagaReducer = class SagaReducer extends Super {

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
      return this.sendValues(this.actions.updateWithValues, values)
    }

    // Exposed as an
    updateWithValues(newState: Partial<T>) {
      this.draftState = {
        ...this.draftState,
        ...newState
      };
    }

    static rootSaga: any;
  }

  function defaultSagas(sagas: string[]) : Saga<any[]> {
    const actions = SagaReducer.actions;
    function* rootSaga() {
      for (let key in actions) {
        if (sagas.includes(key)) {
          const k = key as keyof typeof actions
          const saga = buildSaga<U, T>(SagaReducer, key as any)
          yield takeLatest(actions[k].type, saga);
        }
      }
    }
    return rootSaga;
  }

  // Some el-cheapo inheritance overriding.
  // We delay our saga creation until initialize
  // is called to ensure we have access to our
  // actions/derived implementation
  const superInitialize = Super.initialize
  Super.initialize = function(state) {
    superInitialize.call(this, state, this);
    SagaReducer.rootSaga = Array.isArray(sagas)
      ? defaultSagas(sagas as string[])
      : sagas(SagaReducer.derived);

  }

  // Overwrite the implementation of useStore to start the sagas
  const superUseStore = Super.useStore;
  Super.useStore = function() {
    superUseStore.call(this);
    useInjectSaga({ key, saga: SagaReducer.rootSaga});
  }

  return SagaReducer;
}
