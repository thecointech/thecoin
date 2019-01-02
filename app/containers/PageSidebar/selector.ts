import { createSelector } from 'reselect';
import { ApplicationRootState } from 'types';
import { createStructuredSelector } from 'reselect';
import { ContainerState } from './types';

const selectSidebar = (state: ApplicationRootState) => state.sidebar;

export const mapSidebarStateToProps = createStructuredSelector<ApplicationRootState, ContainerState>({
  // All the keys and values are type-safe
  items: createSelector(selectSidebar, sidebarState => sidebarState.items)
});