import { ApplicationRootState } from '../../types';
import { initialState } from './reducer';

const selectSidebar = (state: ApplicationRootState) => state.sidebar || initialState;

export const mapStateToProps = selectSidebar;