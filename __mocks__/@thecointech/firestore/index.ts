import { setFirestore, Timestamp, getFirestore, MockedDb } from '@thecointech/firestore';
import mocks from 'firestore-jest-mock';

// Helper function to make defining immutable DB's easier
export function immutable(database: MockedDb) {
  database.immutable = true;
  return database;
}

export function init(database: MockedDb = {}) {

  const {immutable, ...rest} = database;
  // Clone the DB (not modifying the source)
  const clone = JSON.parse(JSON.stringify(rest));
  const db = new mocks.FakeFirestore(clone, {
    simulateQueryFilters: true,
    mutable: !immutable,
  } as any);

  // Import the mocked db, and assign.
  Timestamp.init(mocks.FakeFirestore.Timestamp as any);
  setFirestore(db as any);

  return true;
}

export { getFirestore, Timestamp };
