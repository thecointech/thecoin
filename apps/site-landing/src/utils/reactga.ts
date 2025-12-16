import ReactGA from 'react-ga';


function recordLocation(location: { pathname: string }) {
  ReactGA.set({ page: location.pathname });
  ReactGA.pageview(location.pathname);
}

export function initTracking() {
  if (window.location.hostname !== 'localhost') {
    ReactGA.initialize('UA-145583540-1');

    // Record initial location (not caught by the listen)
    recordLocation(window.location);
    // TODO: This code is miles out-of-date.
    // Reimplement from scratch
    // history.listen(recordLocation);
  }
}
