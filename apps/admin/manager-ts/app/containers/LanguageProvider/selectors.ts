import { ApplicationRootState } from 'types';
import { ILanguageProviderProps } from '.';
import { DEFAULT_LOCALE } from 'translations/index.js';

const defaultState : ILanguageProviderProps = {
	"messages": {},
	"locale": DEFAULT_LOCALE
}
/**
 * Direct selector to the languageToggle state domain
 */
const selectLanguage = (state: ApplicationRootState) => state.language || defaultState;

/**
 * Select the language locale
 */
const selectLocale = (state: ApplicationRootState) => selectLanguage(state).locale;

export { selectLanguage, selectLocale };
