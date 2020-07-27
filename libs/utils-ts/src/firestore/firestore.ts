// Store on global to avoid any weirdities

import { Firestore } from "@the-coin/types";

// from importing modules
global.__thecoin = {
  firestore: null
}

export function SetFirestore(db: Firestore)
{
  global.__thecoin.firestore = db;
}


export function GetFirestore() : Firestore
{
  if (!global.__thecoin.firestore)
    throw new Error("Firestore not initialized");
  return global.__thecoin.firestore;
}
