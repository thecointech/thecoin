import { Firestore } from "./types";

type TheCoinGlobals = {
  firestore: Firestore|null;
}
declare global {
  namespace globalThis {
    //  deepcode ignore no-var-keyword: var is necessary for this typing to work
    var __thecoin: TheCoinGlobals
  }
}
// initialize to empty
globalThis.__thecoin = {
  firestore: null,
}

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
