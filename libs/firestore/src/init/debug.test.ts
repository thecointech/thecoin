import { init } from './debug';
import { describe } from '@thecointech/jestutils';
import { GetFirestore, Timestamp } from '.';
import { isEmulatorAvailable } from './types';


///////////////////////////////////////////////////////////////
// For Jest fn's that connect to the emulator:
// Do not attempt to connect if we do not have an
// active connection.
export const filterByEmulator = () => {
  if (!isEmulatorAvailable()) {
    console.warn("Cannot connect to firestore, abandoning unit tests");
    return false;
  }
  return true;
}

//
// Test the connection to the firestore emulator.
//
describe('Our testing correctly connects to Firestore', () => {

  it("connects", async () => {
    const isValid = await init('broker-cad');
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

    await db.collection("test").doc(key).delete();

    // Lets check that we can create a Timestamp
    const ts = Timestamp.now();
    expect(ts).toBeTruthy();
  });
}, filterByEmulator());
