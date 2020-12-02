import { SiteBaseStore } from '../../SiteBaseStore';
import { initialState } from './reducer';

/**
 * Direct selector to the languageToggle state domain
 */
const selectLocale = (state: SiteBaseStore) =>
  state.language ? state.language : initialState;

export { selectLocale };
