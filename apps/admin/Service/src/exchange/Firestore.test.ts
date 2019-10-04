import * as firestore from './Firestore'
import { GetFirestore } from '@the-coin/utilities/lib/Firestore';

process.env.FIRESTORE_EMULATOR_HOST="localhost:8377"
firestore.init();

test("Status is valid", async () => {
  const db = GetFirestore();
  expect(db).toBeDefined();
  
  await db.collection("test").doc("1").set({
    here: true
  });

  var r = await db.collection("test").doc("1").get();
  expect(r.exists).toBeTruthy();
  var data = r.data();
  expect(data!.here).toBeTruthy();
})