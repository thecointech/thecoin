import { Dispatch, bindActionCreators } from 'redux';
import { IFxRates } from './types';
import { actions } from './reducer';
import { useDispatch } from 'react-redux';

// Map Disptach to your DispatchProps
export function mapDispatchToProps(dispatch: Dispatch): IFxRates {
  return (bindActionCreators(actions, dispatch) as any) as IFxRates;
}

export const useFxRatesApi = () => 
  mapDispatchToProps(useDispatch())

