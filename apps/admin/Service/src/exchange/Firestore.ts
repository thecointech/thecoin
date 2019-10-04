import { SetFirestore } from "@the-coin/utilities/lib/Firestore";
import { IsDebug } from "@the-coin/utilities/lib/IsDebug";
import * as admin from 'firebase-admin';

export async function init()
{
  if (IsDebug || process.env.GAE_ENV)
  {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });  
  }
  else {
    admin.initializeApp({
      credential: admin.credential.cert('../../../firestore-db-service-account.json')
    });
  }

  const db = admin.firestore();
  SetFirestore(db);
}
