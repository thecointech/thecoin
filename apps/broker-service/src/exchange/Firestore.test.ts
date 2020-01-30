import { GetFirestore } from '@the-coin/utilities/Firestore';
import * as firestore from './Firestore'

beforeAll(async () => {
  firestore.init();
});

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