import * as firebase from '@firebase/testing';
import "firebase/firestore";
import { SetFirestore, GetFirestore } from './Firestore';

const admin = firebase.initializeAdminApp({
  projectId: "broker-cad",
});

var _db = admin.firestore();
// Note that the Firebase Web SDK must connect to the WebChannel port
_db.settings({
  host: "localhost:8377",
  ssl: false
});
SetFirestore(_db as any);

test("DB is initialized", async () => {
  var db = GetFirestore();
  expect(db).toBeDefined();

  await db.collection("test").doc("1").set({
    here: true
  });

  var r = await db.collection("test").doc("1").get();
  expect(r.exists).toBeTruthy();
  var data = r.data();
  expect(data!.here).toBeTruthy();
});