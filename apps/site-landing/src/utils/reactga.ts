import ReactGA from 'react-ga';
import {history} from '@thecointech/shared/store/history';


function recordLocation(location: { pathname: string }) {
  ReactGA.set({ page: location.pathname });
  ReactGA.pageview(location.pathname);
}

export function initTracking() {
  if (window.location.hostname !== 'localhost') {
    ReactGA.initialize('UA-145583540-1');

    // Record initial location (not caught by the listen)
    recordLocation(window.location);
    history.listen(recordLocation);
  }
}
