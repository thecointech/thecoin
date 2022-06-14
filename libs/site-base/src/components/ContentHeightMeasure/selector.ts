/**
 * Homepage selectors
 */

import { createSelector, createStructuredSelector } from 'reselect';
import { initialState } from './reducer.js';
import { SiteBaseStore } from '../../SiteBaseStore.js';
import { ContentState } from './types.js';

const selectContent = (state: SiteBaseStore) =>
  state.content ? state.content : initialState;

const makeSelectContentHeight = () =>
  createSelector(selectContent, substate => substate.height);

  // Map RootState to your StateProps
const mapStateToProps = createStructuredSelector<SiteBaseStore, ContentState>({
  // All the keys and values are type-safe
  height: makeSelectContentHeight()
});

export { selectContent, makeSelectContentHeight, mapStateToProps };
