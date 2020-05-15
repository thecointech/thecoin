import {Firestore} from '@google-cloud/firestore';
import { SetFirestore } from '@the-coin/utilities/Firestore';

export async function init()
{
  const db = new Firestore();
  SetFirestore(db);
}
