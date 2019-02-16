import { Dispatch, bindActionCreators } from 'redux';
import { IActions } from './types';
import { createActionCreators } from 'immer-reducer';
import { AccountSelectorReducer } from './reducer';

const actions = createActionCreators(AccountSelectorReducer);

// Map Disptach to your DispatchProps
function mapDispatchToProps(dispatch: Dispatch): IActions {
  return (bindActionCreators(actions, dispatch) as any) as IActions;
}

export { IActions as DispatchProps, mapDispatchToProps }

