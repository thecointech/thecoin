
import { GetFirestore } from './Firestore';
import { describe, initializeFirestore } from './Firestore.jestutils';

describe('Basic DB functions', () => {

  test("DB is initialized", async () => {
    var db = await initializeFirestore("broker-cad");
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
})


