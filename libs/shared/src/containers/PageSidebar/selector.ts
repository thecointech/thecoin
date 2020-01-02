import { ApplicationBaseState } from '../../types';
import { initialState } from './reducer';

const selectSidebar = (state: ApplicationBaseState) => state.sidebar || initialState;

export const mapStateToProps = selectSidebar;