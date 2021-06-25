import { createSelector, createStructuredSelector } from 'reselect';
import { SiteBaseStore } from '../../SiteBaseStore';
import { Location } from 'history';


export const selectRoute = (state: SiteBaseStore) => state.router;

export const makeSelectLocation = () =>
  createSelector(selectRoute, routeState => routeState.location);

// Map RootState to your ContainerProps
interface LocationStoreState {
  location: Location;
}

export const mapLocationStateToProps = createStructuredSelector<SiteBaseStore, LocationStoreState>({
  // All the keys and values are type-safe
  location: makeSelectLocation()
});
