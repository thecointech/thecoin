import { createSelector } from 'reselect';
import { ApplicationRootState } from 'types';
import { createStructuredSelector } from 'reselect';
import { Location } from 'history';


const selectRoute = (state: ApplicationRootState) => state.router;

const makeSelectLocation = () =>
  createSelector(selectRoute, routeState => routeState.location);

// Map RootState to your ContainerProps
interface LocationStoreState {
  location: Location;
}

const mapLocationStateToProps = createStructuredSelector<ApplicationRootState, LocationStoreState>({
  // All the keys and values are type-safe
  location: makeSelectLocation()
});

export { mapLocationStateToProps, LocationStoreState };
