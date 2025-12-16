import type { LanguageBaseState } from './types';
import { initialState } from './reducer';

/**
 * Direct selector to the languageToggle state domain
 */
const selectLocale = (state: LanguageBaseState) =>
  state.language ? state.language : initialState;

export { selectLocale };
