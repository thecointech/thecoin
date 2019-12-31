/*
 *
 * LanguageProvider actions
 *
 */

import ActionTypes from './constants';

export function changeLocale(languageLocale) {
  return {
    type: ActionTypes.CHANGE_LOCALE,
    locale: languageLocale,
  };
}
