import { createSelector, createStructuredSelector } from 'reselect';
import { ApplicationRootState } from 'types';
import { initialState } from './reducer';
import { ContentState } from './types';

/**
 * Direct selector to the languageToggle state domain ////Test
 */
const selectLocale = (state: ApplicationRootState) =>
  state.language ? state.language : initialState;

/**
 * Select the language locale
 */
const makeSelectLocale = () =>
createSelector(selectLocale, languageState => languageState.locale);


// Map RootState to your StateProps
const mapStateToProps = createStructuredSelector<ApplicationRootState, ContentState>({
    // All the keys and values are type-safe
    locale: makeSelectLocale(),
});

export { selectLocale, makeSelectLocale, mapStateToProps };
