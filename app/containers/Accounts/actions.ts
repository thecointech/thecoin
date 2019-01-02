import { createActionCreators } from 'immer-reducer';
import { Dispatch, bindActionCreators } from 'redux';
import { AccountsReducer } from './reducer';
import { IActions } from './types';

const Actions = createActionCreators(AccountsReducer);

// Map Disptach to your DispatchProps
export type DispatchProps = IActions;
export function mapDispatchToProps(dispatch: Dispatch): IActions {
  return (bindActionCreators(Actions, dispatch) as any) as IActions;
}
