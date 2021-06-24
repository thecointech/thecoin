import { log } from '@thecointech/logging';
import { InitParams, isMockedDb, isEmulatorAvailable } from './types';

// Connect to a firestore instance.  This function is intended to be used
// any/everywhere that firestore can be accessed, including jest tests.  The
// goal is to provide a consistent experience that degrades gracefully without
// introducing unwanted sideeffects.  The basic logic is this:
// If we have data, we either want:
//    exactly this data, or
//    this is backup data to allow tests in environments without live connection
//
// a running instance.  Some tests may not have
export async function init(params?: InitParams) {
  // If we pass a mocked db, then that is what we want
  if (isMockedDb(params)) {
    if (process.env.NODE_ENV !== 'production') {
      log.debug('Initializing a mocked db');
      const mock = await import('./mock');
      return mock.init(params);
    }
  }
  else {
    // Release build, running on server
    if (process.env.GAE_ENV || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      log.debug('Connecting server-side db running locally');
      const server = await import('./server')
      return server.init();
    }
    // client build, running in electron
    else if (!isMockedDb(params) && params?.password && params?.username) {
      log.debug('Connecting client-side db with user/password');
      const pwd = await import('./password');
      return pwd.init(params.username, params.password);
    }
    // no way to connect online, if we have emulator attempt that connection
    else if (isEmulatorAvailable()) {
      log.debug('No connection parameters supplied, attempting to connect to emulator');
      const project = params?.project;
      const debug = await import('./emulator');
      return debug.init(project);
    }
    // No connections available.  Fallback to mocked DB
    else if (process.env.NODE_ENV !== 'production') {
      log.warn('Initializing to empty mutable mocked db')
      const mock = await import('./mock');
      return mock.init({});
    }
  }
  // No connection.  Better to throw than let the app continue
  throw new Error('No firestore connection possible');
}
