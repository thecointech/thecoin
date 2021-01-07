import {log} from '@the-coin/logging';
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
export async function init(params?: InitParams)
{
  // If we explicitly only want a mocked db, return that
  if (isMockedDb(params) && !params.live) {
    const mock = await import('./mock');
    return await mock.init(params);
  }
  // Release build, running on server
  else if (process.env.GAE_ENV)
  {
    const server = await import('./server')
    return await server.init();
  }
  // client build, running in electron
  else if (!isMockedDb(params) && params?.password && params?.username)
  {
    const pwd = await import('./password');
    return await pwd.init(params.username, params.password);
  }
  // Release build, running locally.  May have data, but prefer live connection
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS)
  {
    const release = await import('./release')
    return await release.init();
  }
  // no way to connect online, if we have emulator attempt that connection
  else if(isEmulatorAvailable())
  {
    log.debug('No connection parameters supplied, attempting to connect to emulator');
    const project = params?.project;
    if (!project || typeof project != "string")
      throw new Error('Cannot connect to emulator without specifying a project');
    const debug = await import('./debug');
    return await debug.init(project);
  }
  // no online db, create a mocked DB with sample data if present or empty DB if not.
  else if (isMockedDb(params)) {
    log.debug('No connection parameters supplied, attempting to connect to emulator');
    const debug = await import('./mock');
    return debug.init(params, params.live);
  }
  else {
    // No connection.  Better to throw than let the app continue
    throw new Error('No firestore connection possible');
  }
}
