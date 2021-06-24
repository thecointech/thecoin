import { describe, filterByEmulator } from './jest.emulator';
import { getFirestore, Timestamp } from '.';
import { log } from '@thecointech/logging';

//
// Test the connection to the firestore emulator.
describe('Our testing correctly connects to Firestore Emulator', () => {

  it("connects", async () => {
    log.debug("Connecting to Firestore Emulator");
    // const { init } = await import('./emulator');
    // const isValid = await init('broker-cad');
    // expect(isValid).toBeTruthy();

    const db = getFirestore();
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
