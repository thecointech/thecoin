import {log} from '@the-coin/logging';

// Do not attempt to connect if we do not have an
// active connection.
export const isEmulatorAvailable = process.env.FIRESTORE_EMULATOR != 'false'

export type MockedDocument = {
  id: string,
  _collections: {
    [name: string]: MockedDocument[],
  }
  [param: string]: any,
}

// Mocked db may be used by our unit tests to supply test data
type MockedDb = {
  // Can our DB connection be established to a live
  // db if available?  This is useful for mocked tests
  // that may also be run against live data.  When set,
  // the data will be made immutable to ensure that a test
  // will not modify the live DB.  This is useful for
  // tests that should always run but may be beneficial
  // to run against live data.  Eg tests that verify that
  // input data is correct are also nice-to-run against live data.
  live?: boolean,
} & {
  [name: string]: MockedDocument[]
}



type ConnectionParams = { project?: string; username?: string; password?: string; };

type InitParams = ConnectionParams|MockedDb;

const isMockedDb = (t?: InitParams) : t is MockedDb =>
  t != undefined && Object.entries(t).every(kv => kv[0] == "readonly" || kv[1].id)

// OUr process is:
export async function init(params?: InitParams)
{
  // If we explicitly only want a mocked db, return that
  if (isMockedDb(params) && !params.live) {
    const mock = await import('./mock');
    return await mock.init(params);
  }

  if (process.env.GAE_ENV) // Release build, running on server
  {
    const server = await import('./server')
    return await server.init();
  }
  else if (params?.password && params?.username) // client build, running in electron
  {
    const pwd = await import('./password');
    return await pwd.init(params.username, params.password);
  }
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) // Release build, running locally (should still talk to server)
  {
    const release = await import('./release')
    return await release.init();
  }
  else if(isEmulatorAvailable) // no way to connect online, try connecting to localhost emulator
  {
    log.debug('No connection parameters supplied, attempting to connect to emulator');
    if (!connection?.project)
      throw new Error('Cannot connect to emulator without specifying a project');
    const debug = await import('./debug');
    return await debug.init(connection.project);
  }
  else {
    log.debug('No connection parameters supplied, attempting to connect to emulator');
    if (!connection?.project)
      throw new Error('Cannot connect to emulator without specifying a project');
    const debug = await import('./debug');
    return await debug.init(connection.project);
  }
}
