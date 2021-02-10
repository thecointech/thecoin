import { Firestore } from "@the-coin/types";

// Store on global to avoid any weirdities
export function SetFirestore(db: Firestore)
{
  globalThis.__thecoin = {
    ...globalThis.__thecoin,
    firestore: db,
  };
}


export function GetFirestore() : Firestore
{
  if (!globalThis.__thecoin.firestore)
    throw new Error("Firestore not initialized");
  return globalThis.__thecoin.firestore;
}
