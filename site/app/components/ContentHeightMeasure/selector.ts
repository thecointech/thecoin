/**
 * Homepage selectors
 */

import { createSelector, createStructuredSelector } from 'reselect';
import { initialState } from './reducer';
import { ApplicationRootState } from 'types';
import { ContainerState } from './types';

const selectContent = (state: ApplicationRootState) =>
  state.content ? state.content : initialState;

const makeSelectContentHeight = () =>
  createSelector(selectContent, substate => substate.height);

  // Map RootState to your StateProps
const mapStateToProps = createStructuredSelector<ApplicationRootState, ContainerState>({
  // All the keys and values are type-safe
  height: makeSelectContentHeight()
});

export { selectContent, makeSelectContentHeight, ContainerState, mapStateToProps };
