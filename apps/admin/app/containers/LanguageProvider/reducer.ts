/*
 *
 * LanguageProvider reducer
 *
 */

import { CHANGE_LOCALE } from './constants';
import { DEFAULT_LOCALE } from 'translations/index.js';
import { Action } from 'redux';

export const initialState = {
  locale: DEFAULT_LOCALE,
};

type ActionType = Action & typeof initialState;

function languageProviderReducer(state = initialState, action: ActionType) {
  switch (action.type) {
    case CHANGE_LOCALE:
      return { locale: action.locale };
    default:
      return state;
  }
}

export default languageProviderReducer;
