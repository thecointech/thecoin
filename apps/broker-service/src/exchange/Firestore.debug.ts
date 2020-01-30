import { SetFirestore } from "@the-coin/utilities/Firestore";
import { Firestore, Settings } from '@google-cloud/firestore';

export async function init()
{
  process.env.FIRESTORE_EMULATOR_HOST="localhost:8377"
  // Note that the Firebase Web SDK must connect to the WebChannel port
  const settings: Settings = {
    projectId: 'broker-cad',
    host: "localhost:8377",
    ssl: false
  };
  const db = new Firestore(settings);
  SetFirestore(db);
}