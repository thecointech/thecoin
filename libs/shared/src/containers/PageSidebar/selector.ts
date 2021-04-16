import { ApplicationBaseState } from '../../types';
import { initialState } from './reducer';

export const selectSidebar = (state: ApplicationBaseState) => state.sidebar || initialState;
