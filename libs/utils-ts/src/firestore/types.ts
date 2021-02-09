
// Do not attempt to connect if we do not have an
// active connection.
export const isEmulatorAvailable = () => process.env.FIRESTORE_EMULATOR !== 'false'

// Mocked DB structure
export type MockedDocument = {
  id: string,
  _collections?: {
    [name: string]: MockedDocument[],
  }
  [param: string]: unknown,
}

// Mocked db may be used by our unit tests to supply test data
export type MockedData = {
  [name: string]: MockedDocument[]
}
export type MockedDb = {
  // Can our DB connection be established to a live
  // db if available?  This is useful for mocked tests
  // that may also be run against live data.  When set,
  // the data will be made immutable to ensure that a test
  // will not modify the live DB.  This is useful for
  // tests that should always run but may be beneficial
  // to run against live data.  Eg tests that verify that
  // input data is correct are also nice-to-run against live data.
  live?: boolean,
} & MockedData;

// Function to ease creating mocked jest data (ts doesn't like the mix of bool & string index type)
export const liveOrMock = (data: MockedData) : MockedDb => Object.assign({ live: true }, data);

export type ConnectionParams = { project?: string; username?: string; password?: string; };

export type InitParams = ConnectionParams|MockedDb;

export const isMockedDb = (t?: InitParams) : t is MockedDb =>
  t !== undefined && Object.entries(t).every(kv => (
    kv[0] === "live" ||
    (Array.isArray(kv[1]) && kv[1].every((doc: MockedDocument) => doc.id))
  ))
