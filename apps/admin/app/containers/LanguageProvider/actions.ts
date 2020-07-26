/*
 *
 * LanguageProvider actions
 *
 */

import { CHANGE_LOCALE } from './constants';

export function changeLocale(languageLocale: string) {
  return {
    type: CHANGE_LOCALE,
    locale: languageLocale,
  };
}
