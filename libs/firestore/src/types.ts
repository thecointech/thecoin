import type firestore from '@google-cloud/firestore';
import type firebase from 'firebase/app';

export type FirestoreClient = firebase.firestore.Firestore;
export type FirestoreAdmin = firestore.Firestore;

// Export the basic types we are likely to name elsewhere
export type CollectionReference<T> = firebase.firestore.CollectionReference<T>|firestore.CollectionReference<T>;
export type DocumentReference<T> = firebase.firestore.DocumentReference<T>|firestore.DocumentReference<T>;
export type DocumentSnapshot<T> = firebase.firestore.DocumentSnapshot<T>|firestore.DocumentSnapshot<T>;

// WriteBatch cannot be merged (self-referentiality breaks on union) so we define a stripped-down version
export interface WriteBatch {
  set<T>(
    documentRef: DocumentReference<T>,
    data: Partial<T>,
    options: firestore.SetOptions
  ): WriteBatch;
  set<T>(documentRef: DocumentReference<T>, data: T): WriteBatch;
  commit(): Promise<void|firestore.WriteResult[]>;
}
// Replace built-in batch with our stripped-down version.
export type Firestore = Omit<FirestoreAdmin|FirestoreClient, "batch"> & {
  batch: () => WriteBatch;
};

// Do not attempt to connect if we do not have an
// active connection.
export const isEmulatorAvailable = () => process.env.FIRESTORE_EMULATOR_PORT && process.env.FIRESTORE_EMULATOR_PORT !== 'false'

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

export type ConnectionParams = { project?: string; username?: string; password?: string; };

export type InitParams = ConnectionParams|MockedDb;

export const isMockedDb = (t?: InitParams) : t is MockedDb =>
  t !== undefined && Object.entries(t).every(kv => (
    kv[0] === "mutable" ||
    (Array.isArray(kv[1]) && kv[1].every((doc: MockedDocument) => doc.id))
  ))
