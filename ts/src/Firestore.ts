import { Firestore, Timestamp } from "./FirebaseFirestore";

let __firestore: Firestore|null = null;

function SetFirestore(db: Firestore)
{
  __firestore = db;
}


function GetFirestore()
{
  if (!__firestore)
    throw new Error("Firestore not initialized");
  return __firestore;
}

interface ProcessRecord { 
  recievedTimestamp: Timestamp,
  processedTimestamp?: Timestamp,
  hash: string,
  confirmed: boolean,
  fiatDisbursed: number
}

export { SetFirestore, GetFirestore, ProcessRecord };
