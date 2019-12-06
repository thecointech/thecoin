import { createActionCreators } from 'immer-reducer';
import { Dispatch, bindActionCreators } from 'redux';
import { SidebarItemsReducer } from './reducer';
import { IActions } from './types';

const Actions = createActionCreators(SidebarItemsReducer);

// Map Disptach to your DispatchProps
export type DispatchProps = IActions;
export function Dispatch(dispatch: Dispatch): IActions {
  return (bindActionCreators(Actions, dispatch) as any) as IActions;
}
