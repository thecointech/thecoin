import type { ApplicationBaseState } from '../../types';
import { initialState } from './reducer.js';

/**
 * Direct selector to the languageToggle state domain
 */
const selectLocale = (state: ApplicationBaseState) =>
  state.language ? state.language : initialState;

export { selectLocale };
