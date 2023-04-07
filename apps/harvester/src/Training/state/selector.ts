/**
 * Homepage selectors
 */

import { initialState } from './reducer';
import { TrainingState } from './types';

const selectTraining = (state: any) : TrainingState =>
  state.training ? state.training : initialState;


export { selectTraining };
