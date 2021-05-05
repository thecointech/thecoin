//import type { Firestore as FirestoreAdmin } from '@google-cloud/firestore';
//import type { Firestore as FirestoreClient } from 'firebase/firestore';

import { Firestore } from "@thecointech/types";

// Store on global to avoid any weirdities
export function setFirestore(db: Firestore)
{
  globalThis.__thecoin = {
    ...globalThis.__thecoin,
    firestore: db,
  };
}


export function getFirestore() : Firestore
{
  if (!globalThis.__thecoin.firestore)
    throw new Error("Firestore not initialized");
  return globalThis.__thecoin.firestore;
}
