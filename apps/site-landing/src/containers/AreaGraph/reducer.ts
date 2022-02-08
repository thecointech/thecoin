
import type { ApplicationRootState } from 'types'
import { BaseReducer } from '@thecointech/shared/store/immerReducer';
import { AreaDatum, HoveredState, IActions } from './types';


const HOVERED_KEY: keyof ApplicationRootState = "hovered";
const initialState = { hovered: undefined };

export class GraphHoverReducer extends BaseReducer<IActions, HoveredState>(HOVERED_KEY, initialState)
implements IActions {
  setHovered(hovered?: AreaDatum): void {
    this.draftState.hovered = hovered;
  }
}
