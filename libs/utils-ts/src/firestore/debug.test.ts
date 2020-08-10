import { init as init_db, describe } from './jestutils';
import { GetFirestore, Timestamp } from '.';

//
// Test the connection to the firestore emulator.
//
describe('Our testing correctly connects to Firestore', () => {

  it("connects", async () => {

    var isValid = await init_db('broker-cad');
    expect(isValid).toBeTruthy();

    const db = GetFirestore();
    expect(db).toBeDefined();

    // try {
    //   const ival = await db.collection('test').doc("1").get();
    //   expect(ival).toBeNull();
    // }
    // catch(err) {
    //   console.log(err);
    // }

    try {
      var s = db.collection("test").doc("1").set({
        here: true
      });
      await s;
    }
    catch (err) {
      console.error(err);
    }

    var r = await db.collection("test").doc("1").get();
    expect(r.exists).toBeTruthy();
    var data = r.data();
    expect(data!.here).toBeTruthy();

    // Lets check that we can create a Timestamp
    var ts = Timestamp.now();
    expect(ts).toBeTruthy();
  });
});
