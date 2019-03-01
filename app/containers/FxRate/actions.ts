import { Dispatch, bindActionCreators } from 'redux';
import { IActions } from './types';
import { actions } from './reducer';

// Map Disptach to your DispatchProps
function mapDispatchToProps(dispatch: Dispatch): IActions {
  return (bindActionCreators(actions, dispatch) as any) as IActions;
}

export { IActions as DispatchProps, mapDispatchToProps }

