import { SetFirestore } from './firestore';
import { Timestamp } from './timestamp';
import mocks from 'firestore-jest-mock';

export async function init(database: object) {

  // Clone the DB (not modifying the source)
  const clone = JSON.parse(JSON.stringify(database));
  // Import the mocked db, and assign.
  Timestamp.init(mocks.FakeFirestore.Timestamp);
  SetFirestore(new mocks.FakeFirestore(clone));
}
