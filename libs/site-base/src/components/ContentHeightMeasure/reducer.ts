
import { BaseReducer } from '@thecointech/redux'
import { ContentState, IActions } from './types';
import { SiteBaseStore } from '../../SiteBaseStore';

const CONTENT_KEY: keyof SiteBaseStore = "content";

// The initial state of the App
export const initialState: ContentState = {
  height: 250,
};

let lastTimestamp = 0;
export class HeightMeasureReducer extends BaseReducer<IActions, ContentState>(CONTENT_KEY, initialState)
  implements IActions {
  setHeight(newHeight: number, timestamp: number) {
    if (timestamp < lastTimestamp)
      return;
    this.draftState.height = newHeight;
    lastTimestamp = timestamp;
  }
}
