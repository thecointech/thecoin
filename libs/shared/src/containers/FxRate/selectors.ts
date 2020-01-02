/**
 * Homepage selectors
 */

import { ApplicationBaseState } from '../../types';
import { ContainerState } from './types';

const selectFxRate = (state: ApplicationBaseState) =>  state.fxRates;

export { selectFxRate, ContainerState };