import * as firebase from '@firebase/testing';
import "firebase/firestore";
import { SetFirestore, GetFirestore } from './Firestore';

const FirestorePort = 8377;


test("DB is initialized", async () => {
  var db = await initializeFirestore();
  if (!db)
    return;

  // Ensure we are talking to the right datastore
  expect(db).toEqual(GetFirestore());
  await db.collection("test").doc("1").set({
    here: true
  });

  var r = await db.collection("test").doc("1").get();
  expect(r.exists).toBeTruthy();
  var data = r.data();
  expect(data!.here).toBeTruthy();
});

///////////////////////////////////////////////////////////////
// Firestore helper functions
const isPortTaken = (port: number) =>
  new Promise(resolve => {
    const server = require('http')
      .createServer()
      .listen(port, () => {
        server.close()
        resolve(false)
      })
      .on('error', () => {
        resolve(true)
      })
  })

export const initializeFirestore = async () =>
{
  if (await isPortTaken(FirestorePort))
  {
    console.warn("Cannot connect to firestore, abandoning unit tests")
    return null;
  }

  const admin = firebase.initializeAdminApp({
    projectId: "broker-cad",
  });

  var _db = admin.firestore();
  // Note that the Firebase Web SDK must connect to the WebChannel port
  _db.settings({
    host: `localhost:${FirestorePort}`,
    ssl: false
  });
  SetFirestore(_db as any);
  return _db;
}
