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
  recievedTimestamp: Timestamp|Date,
  processedTimestamp?: Timestamp|Date,
  hash: string,
  confirmed: boolean,
  fiatDisbursed: number
}

function isDate(d: Timestamp|Date) : d is Date {
  return (d as Date).getFullYear != undefined;
} 
function isTimestamp(d: Timestamp|Date) : d is Timestamp {
  return (d as Timestamp).nanoseconds != undefined;
} 

function AsDate(d: Timestamp|Date) : Date {
  if (isDate(d))
    return d;
  else return d.toDate();
}
export { SetFirestore, GetFirestore, ProcessRecord, AsDate, isDate, isTimestamp }
