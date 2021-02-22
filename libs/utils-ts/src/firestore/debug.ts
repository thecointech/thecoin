
//import "firestore-admin";
// import { SetFirestore } from './firestore';
// import { Timestamp } from './timestamp';

export async function init(_projectId: string) : Promise<boolean> {

  // If emulator wanted, both admin API and web API can connect to emulator now
  // https://firebase.google.com/docs/emulator-suite/connect_firestore#web
  throw new Error('firestore/testing broken with upgrade to Node14.');
  // // Directly link to appropriate Timestamp
  // // Do this first so even if we don't have a running instance
  // // we can still run tests that work with TimeStamp
  // Timestamp.init(firebase.firestore.Timestamp)

  // const admin = firebase.initializeAdminApp({
  //   projectId,
  // });

  // var _db = admin.firestore();
  // // Note that the Firebase Web SDK must connect to the WebChannel port
  // _db.settings({
  //   host: `localhost:${process.env.FIRESTORE_EMULATOR}`,
  //   ssl: false
  // });
  // SetFirestore(_db as any);

  // return true;
}

export async function release() {
  //await Promise.all(firebase.apps().map(app => app.delete()));
}
