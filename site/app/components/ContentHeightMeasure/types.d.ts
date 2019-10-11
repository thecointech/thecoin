import * as actions from './actions';
import { ApplicationRootState } from 'types';

/* --- STATE --- */
interface ContentState {
  readonly height: number;
}

/* --- ACTIONS --- */
interface IActions {
  setHeight(newHeight: number, timestamp: number): void;
}

/* --- EXPORTS --- */

type ContainerState = ContentState;

export { IActions, ContainerState };
