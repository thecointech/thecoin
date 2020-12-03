/*
 *
 * LanguageProvider reducer
 *
 */
import { TheCoinReducer, GetNamedReducer } from '@the-coin/shared/utils/immerReducer';
import { useInjectReducer } from 'redux-injectors';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ContentState, DEFAULT_LOCALE, IActions, Locale } from './types';
import { SiteBaseStore } from '../../SiteBaseStore';

export const initialState = {
  locale: DEFAULT_LOCALE as Locale,
};

const LANGUAGE_KEY : keyof SiteBaseStore = "language";
export type ContainerState = Readonly<typeof initialState>;

export class LanguageProviderReducer extends TheCoinReducer<ContentState>
  implements IActions {
    setLocale(locale: Locale) {
      this.draftState.locale = locale;
    }
}

export const useLanguageProvider = () => {
  const { reducer, actions } = GetNamedReducer(LanguageProviderReducer, LANGUAGE_KEY, initialState);
  useInjectReducer({ key: LANGUAGE_KEY, reducer });
  return (bindActionCreators(actions, useDispatch()) as IActions) as IActions;
};
