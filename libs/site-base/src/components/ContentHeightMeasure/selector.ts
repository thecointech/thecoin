/**
 * Homepage selectors
 */

import { createSelector, createStructuredSelector } from 'reselect';
import { initialState } from './reducer';
import { SiteBaseStore } from '../../SiteBaseStore';
import { ContentState } from './types';

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
