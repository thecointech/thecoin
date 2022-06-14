/**
 * Homepage selectors
 */

import { ApplicationBaseState } from '../../types.js';
import { useSelector } from 'react-redux';

export const selectFxRate = (state: ApplicationBaseState) =>  state.fxRates;

export const useFxRates = () => useSelector(selectFxRate);
