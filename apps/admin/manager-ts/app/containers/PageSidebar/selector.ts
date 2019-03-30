import { ApplicationRootState } from 'types';

const selectSidebar = (state: ApplicationRootState) => state.sidebar;

export const mapStateToProps = selectSidebar; //createStructuredSelector<ApplicationRootState, ContainerState>({
  // All the keys and values are type-safe
  //items: createSelector(selectSidebar, sidebarState => sidebarState.items)
//});