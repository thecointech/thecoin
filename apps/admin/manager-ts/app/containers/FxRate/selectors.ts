/**
 * Homepage selectors
 */

import { ApplicationRootState } from 'types';
import { ContainerState } from './types';

const selectFxRate = (state: ApplicationRootState) =>  state.fxRates;

export { getFxRate } from './reducer';
export { selectFxRate, ContainerState };