/*
 *
 * LanguageProvider reducer
 *
 */
//import ActionTypes from './constants';
import { DEFAULT_LOCALE } from '../../i18n';
import { TheCoinReducer, GetNamedReducer } from '@the-coin/shared/utils/immerReducer';
import { ContentState, IActions } from './types';
import { SiteBaseStore } from 'SiteBaseStore';
import { useInjectReducer } from 'redux-injectors';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';


export const initialState = {
  locale: DEFAULT_LOCALE,
};
const CONTENT_KEY : keyof SiteBaseStore = "language";
export type ContainerState = Readonly<typeof initialState>;

export class LanguageProviderReducer extends TheCoinReducer<ContentState>
  implements IActions {
    setLocale(locale: string) {
      this.draftState.locale = locale;
    }
}

export const useLanguageProvider = () => {
  const { reducer, actions } = GetNamedReducer(LanguageProviderReducer, CONTENT_KEY, initialState);
  useInjectReducer({ key: CONTENT_KEY, reducer });
  return (bindActionCreators(actions, useDispatch()) as IActions) as IActions;
};
