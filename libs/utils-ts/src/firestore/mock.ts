import { SetFirestore } from './firestore';
import { Timestamp } from './timestamp';
import mocks from 'firestore-jest-mock';
import { MockedDb } from './types';

export function init(database: MockedDb, immutable?: boolean) {

  // Clone the DB (not modifying the source)
  let clone = JSON.parse(JSON.stringify(database));
  const db = new mocks.FakeFirestore(clone);

  // If this is a test is allowed to ping the live
  // DB when available, ensure it safe by enforcing readonly
  if (immutable) {
    db.set = async () => { throw new Error("Error: read-only test attempting to modify database"); }
  }

  // Import the mocked db, and assign.
  Timestamp.init(mocks.FakeFirestore.Timestamp);
  SetFirestore(db);

  return true;
}
