// Unify client-side & server-side API's so our libraries
// can be agnostic of the environment they run in.

import type firestore from '@google-cloud/firestore';
import type firebase from 'firebase/app';

export type FirestoreClient = firebase.firestore.Firestore;
export type FirestoreAdmin = firestore.Firestore;

// Export the basic types we are likely to name elsewhere
export type DocumentSnapshot<T> = firebase.firestore.DocumentSnapshot<T>|firestore.DocumentSnapshot<T>;
export type QueryDocumentSnapshot<T = DocumentData> = firebase.firestore.QueryDocumentSnapshot<T>|firestore.QueryDocumentSnapshot<T>;
export type FirestoreDataConverter<T> = firebase.firestore.FirestoreDataConverter<T>|firestore.FirestoreDataConverter<T>;
export type DocumentData = firebase.firestore.DocumentData|firestore.DocumentData;
export type SetOptions = firebase.firestore.SetOptions|firestore.SetOptions;

// Typescript cannot workout both generics/overloads/union simultaneously
export type CollectionReference<T=DocumentData> = Omit<firebase.firestore.CollectionReference<T>|firestore.CollectionReference<T>, "withConverter"> & {
  withConverter<U>(
    converter: FirestoreDataConverter<U>
  ): CollectionReference<U>;
  // listDocuments only present on server library
  listDocuments?: () => Promise<Array<DocumentReference<T>>>;
}
export type DocumentReference<T=DocumentData> = Omit<firebase.firestore.DocumentReference<T>|firestore.DocumentReference<T>, "collection"> & {
  collection(id: string): CollectionReference
};

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
export type Firestore = Omit<FirestoreAdmin|FirestoreClient, "batch"|"collection"> & {
  batch: () => WriteBatch;
  collection: (path: string) => CollectionReference;
  //collection: <T>(path: string) => CollectionReference<T>;
};
