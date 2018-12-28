/**
 * Homepage selectors
 */

import { createSelector } from 'reselect';
import { ApplicationRootState } from 'types';
import { initialState } from './reducer';

const selectContent = (state: ApplicationRootState) =>
  state.content ? state.content : initialState;

const makeSelectContentHeight = () =>
  createSelector(selectContent, substate => substate.height);

export { selectContent, makeSelectContentHeight };
