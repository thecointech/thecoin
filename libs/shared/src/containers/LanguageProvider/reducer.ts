/*
 * LanguageProvider reducer
 */
import { BaseReducer } from '../../store/immerReducer';
import { LanguageProviderState, DEFAULT_LOCALE, IActions, Locale } from './types';
import type { ApplicationBaseState } from '../../types';

export const initialState: LanguageProviderState = {
  locale: DEFAULT_LOCALE as Locale,
};

const LANGUAGE_KEY : keyof ApplicationBaseState = "language";

export class LanguageProviderReducer extends BaseReducer<IActions, LanguageProviderState>(LANGUAGE_KEY, initialState)
  implements IActions {
    setLocale(locale: Locale) {
      this.draftState.locale = locale;
    }
}
