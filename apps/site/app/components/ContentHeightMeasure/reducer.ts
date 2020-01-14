
import { TheCoinReducer, GetNamedReducer } from '@the-coin/shared/utils/immerReducer'
import { ContentState, IActions } from './types';
import { ApplicationRootState } from 'types';
import { injectReducer } from 'redux-injectors';

const CONTENT_KEY : keyof ApplicationRootState = "content";

// The initial state of the App
const initialState: ContentState = {
  height: 250,
};

let lastTimestamp = 0;
class HeightMeasureReducer extends TheCoinReducer<ContentState>
  implements IActions {
  setHeight(newHeight: number, timestamp: number) {
    if (timestamp < lastTimestamp)
      return;
    this.draftState.height = newHeight;
    lastTimestamp = timestamp;
  }
}

const { reducer, actions } = GetNamedReducer(HeightMeasureReducer, CONTENT_KEY, initialState);

function buildReducer() {
  return injectReducer({
    key: CONTENT_KEY,
    reducer: reducer
  });
}

export { actions, buildReducer, HeightMeasureReducer, CONTENT_KEY, initialState }
