if (process.env.NODE_ENV === "development") {
  require('./mock-shimJest');
}
import { setFirestore } from './firestore';
import { Timestamp } from './timestamp';
import mocks from 'firestore-jest-mock';
import { MockedDb } from './types';

// Helper function to make defining immutable DB's easier
export function immutable(database: MockedDb) {
  database.immutable = true;
  return database;
}

export function init(database: MockedDb) {

  const {immutable, ...rest} = database;
  // Clone the DB (not modifying the source)
  const clone = JSON.parse(JSON.stringify(rest));
  const db = new mocks.FakeFirestore(clone, {mutable: !immutable});

  // Import the mocked db, and assign.
  Timestamp.init(mocks.FakeFirestore.Timestamp);
  setFirestore(db);

  return true;
}
