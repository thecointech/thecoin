
import injectReducer from '@the-coin/shared/utils/injectReducer';
import { TheCoinReducer, GetNamedReducer } from '@the-coin/shared/utils/immerReducer'
import { ContainerState, IActions } from './types';
import { ApplicationRootState } from 'types';

const CONTENT_KEY : keyof ApplicationRootState = "content";

// The initial state of the App
const initialState: ContainerState = {
  height: 250,
};

let lastTimestamp = 0;
class HeightMeasureReducer extends TheCoinReducer<ContainerState>
  implements IActions {
  setHeight(newHeight: number, timestamp: number) {
    if (timestamp < lastTimestamp)
      return;
    this.draftState.height = newHeight;
    lastTimestamp = timestamp;
  }
}

const { reducer, actions } = GetNamedReducer(HeightMeasureReducer, CONTENT_KEY, initialState);

function buildReducer<T>() {
  return injectReducer<T>({
    key: CONTENT_KEY,
    reducer: reducer
  });
}

export { actions, buildReducer, HeightMeasureReducer, CONTENT_KEY, initialState }