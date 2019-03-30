import { ApplicationRootState } from 'types';
import { initialState } from './reducer';

const selectSidebar = (state: ApplicationRootState) => state.sidebar || initialState;

export const mapStateToProps = selectSidebar; //createStructuredSelector<ApplicationRootState, ContainerState>({
  // All the keys and values are type-safe
  //items: createSelector(selectSidebar, sidebarState => sidebarState.items)
//});