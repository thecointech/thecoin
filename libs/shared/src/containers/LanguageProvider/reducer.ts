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

const { reducer, actions} = LanguageProviderReducer.buildReducers(LanguageProviderReducer, initialState);
export const useLanguageProvider = () => {
  useInjectReducer({ key: LANGUAGE_KEY, reducer });
}
export const useLanguageProviderApi = () => {
  return (bindActionCreators(actions, useDispatch()) as IActions) as IActions;
};
