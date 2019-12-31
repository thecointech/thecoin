import { createSelector, createStructuredSelector } from 'reselect';
import { ApplicationRootState } from 'types';
import { Location } from 'history';


export const selectRoute = (state: ApplicationRootState) => state.router;

export const makeSelectLocation = () =>
  createSelector(selectRoute, routeState => routeState.location);

// Map RootState to your ContainerProps
interface LocationStoreState {
  location: Location;
}

export const mapLocationStateToProps = createStructuredSelector<ApplicationRootState, LocationStoreState>({
  // All the keys and values are type-safe
  location: makeSelectLocation()
});