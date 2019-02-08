import { ImmerReducer, createReducerFunction } from 'immer-reducer';
import injectReducer from 'utils/injectReducer';
import { ContainerState } from './types';
import { IActions } from './types';

// The initial state of the App
export const initialState: ContainerState = {
  height: 250,
};

let lastTimestamp = 0;
export class HeightMeasureReducer extends ImmerReducer<ContainerState>
  implements IActions {
  setHeight(newHeight: number, timestamp: number) {
    if (timestamp < lastTimestamp) return;
    this.draftState.height = newHeight;
    lastTimestamp = timestamp;
  }
}

const reducer = createReducerFunction(HeightMeasureReducer, initialState);

export function buildReducer<T>() {
  return injectReducer<T>({
    key: 'content',
    reducer: reducer,
    initialState,
  });
}
