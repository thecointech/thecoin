/*
 *
 * LanguageProvider actions
 *
 */

import ActionTypes from './constants';

export function changeLocale(languageLocale: string) {
  return {
    type: ActionTypes.CHANGE_LOCALE,
    locale: languageLocale,
  };
}
