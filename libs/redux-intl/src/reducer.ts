/*
 * LanguageProvider reducer
 */
import { BaseReducer } from '@thecointech/redux/immerReducer';
import type { LanguageProviderState, IActions, Locale, LanguageBaseState } from './types';

export const DEFAULT_LOCALE: Locale = "en";
export const LANGUAGE_KEY: keyof LanguageBaseState = "language";

export const initialState: LanguageProviderState = {
  locale: DEFAULT_LOCALE as Locale,
};


export class LanguageProviderReducer extends BaseReducer<IActions, LanguageProviderState>(LANGUAGE_KEY, initialState)
  implements IActions {
    setLocale(locale: Locale) {
      this.draftState.locale = locale;
    }
}
