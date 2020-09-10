import { init as init_db, describe, release } from './jestutils';
import { GetFirestore, Timestamp } from '.';

//
// Test the connection to the firestore emulator.
//
describe('Our testing correctly connects to Firestore', () => {

  afterAll(release);

  it("connects", async () => {
    const isValid = await init_db('broker-cad');
    expect(isValid).toBeTruthy();

    const db = GetFirestore();
    expect(db).toBeDefined();

    const key = Date.now().toString();
    let r = await db.collection("test").doc(key).get();
    expect(r.exists).toBeFalsy();

    await db.collection("test").doc(key).set({
      here: true
    });

    r = await db.collection("test").doc(key).get();
    expect(r.exists).toBeTruthy();
    const data = r.data();
    expect(data!.here).toBeTruthy();

    // Lets check that we can create a Timestamp
    const ts = Timestamp.now();
    expect(ts).toBeTruthy();
  });
});
