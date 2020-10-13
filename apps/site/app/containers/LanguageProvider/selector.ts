import { ApplicationRootState } from 'types';
import { initialState } from './reducer';

/**
 * Direct selector to the languageToggle state domain
 */
const selectLocale = (state: ApplicationRootState) =>
  state.language ? state.language : initialState;

export { selectLocale };