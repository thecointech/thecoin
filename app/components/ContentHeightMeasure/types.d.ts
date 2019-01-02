import * as actions from './actions';

/* --- STATE --- */
interface ContentState {
  readonly height: number;
}

/* --- ACTIONS --- */
interface IActions {
  setHeight(newHeight: number): void;
}

/* --- EXPORTS --- */

type ContainerState = ContentState;

export { IActions, ContainerState };
