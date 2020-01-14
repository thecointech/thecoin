/**
 * Homepage selectors
 */

import { ApplicationBaseState } from '../../types';

export const selectFxRate = (state: ApplicationBaseState) =>  state.fxRates;
