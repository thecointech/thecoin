import { register as shim } from '@thecointech/jestutils/shim';
import { setFirestore } from './store';
import { log } from '@thecointech/logging';

// If we are running in regular node (not jest) we need to provide
// a jest object so our jest-mock firestore will load
shim.on();
const mocks = await import('firestore-jest-mock');
shim.off();

export * from './store';
export const Timestamp = mocks.FakeFirestore.Timestamp
export const FieldValue = mocks.FakeFirestore.FieldValue;

// Helper function to make defining immutable DB's easier
export function immutable(database: MockedDb) {
  database.immutable = true;
  return database;
}

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
  immutable?: boolean, // NOTE: mutable by default
} & MockedData;

const isMockedDb = (t?: any) : t is MockedDb =>
  t !== undefined && Object.entries(t).every(kv => (
    kv[0] === "mutable" ||
    (Array.isArray(kv[1]) && kv[1].every((doc: MockedDocument) => doc.id))
  ))

export type MockedInit = MockedDb;
export async function init(init?: MockedDb) {
  log.debug('Connecting to mocked firestore');

  const {immutable, ...rest} = isMockedDb(init)
    ? init
    : { immutable: false }
  // Clone the DB (not modifying the source)
  const clone = JSON.parse(JSON.stringify(rest));
  const db = new mocks.FakeFirestore(clone, {
    simulateQueryFilters: true,
    mutable: !immutable,
  } as any);

  (db as any).terminate = () => {};

  // Import the mocked db, and assign.
  setFirestore(db as any);

  return true;
}
