/*
 *
 * LanguageProvider reducer
 *
 */
import { TheCoinReducer } from '../../store/immerReducer';
import { useInjectReducer } from 'redux-injectors';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { LanguageProviderState, DEFAULT_LOCALE, IActions, Locale } from './types';
import { ApplicationBaseState } from '../../types';
import { createReducerFunction, createActionCreators } from 'immer-reducer';

export const initialState: LanguageProviderState = {
  locale: DEFAULT_LOCALE as Locale,
};

const LANGUAGE_KEY : keyof ApplicationBaseState = "language";

export class LanguageProviderReducer extends TheCoinReducer<LanguageProviderState>
  implements IActions {
    setLocale(locale: Locale) {
      this.draftState.locale = locale;
    }
}

export const useLanguageProvider = (initial?: LanguageProviderState) => {
  const reducer: any = createReducerFunction(LanguageProviderReducer, initial ?? initialState);
  useInjectReducer({ key: LANGUAGE_KEY, reducer });
}
export const useLanguageProviderApi = () => {
  const actions = createActionCreators(LanguageProviderReducer);
  //const { reducer, actions } = GetNamedReducer(LanguageProviderReducer, LANGUAGE_KEY, initialState);
  //useInjectReducer({ key: LANGUAGE_KEY, reducer });
  return (bindActionCreators(actions, useDispatch()) as IActions) as IActions;
};
