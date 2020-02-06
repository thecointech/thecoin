/**
 * Homepage selectors
 */

import { ApplicationBaseState } from '../../types';
import { useSelector } from 'react-redux';

export const selectFxRate = (state: ApplicationBaseState) =>  state.fxRates;

export const useFxRates = () => useSelector(selectFxRate);
