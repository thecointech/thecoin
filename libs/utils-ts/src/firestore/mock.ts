import { SetFirestore } from './firestore';
import { Timestamp } from './timestamp';
import mocks from 'firestore-jest-mock';

export async function init(database: object) {

  // Import the mocked db, and assign.
  Timestamp.init(mocks.FakeFirestore.Timestamp);
  SetFirestore(new mocks.FakeFirestore(database));
}
