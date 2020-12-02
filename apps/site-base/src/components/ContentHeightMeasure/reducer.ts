
import { TheCoinReducer, GetNamedReducer } from '@the-coin/shared/utils/immerReducer'
import { ContentState, IActions } from './types';
import { ApplicationRootState } from 'SiteBaseStore';
import { useInjectReducer } from 'redux-injectors';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';

const CONTENT_KEY : keyof ApplicationRootState = "content";

// The initial state of the App
export const initialState: ContentState = {
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

export const useHeightMeasure = () => {
  const { reducer, actions } = GetNamedReducer(HeightMeasureReducer, CONTENT_KEY, initialState);
  useInjectReducer({ key: CONTENT_KEY, reducer });
  return (bindActionCreators(actions, useDispatch()) as any) as IActions;
}
