import { init as debuginit, describe } from './jestutils';
import { GetFirestore } from '.';
import { init } from './debug';

describe('Our testing correctly connects to Firestore', () => {

  test("Status is valid", async () => {
    const db = await debuginit('utilities');
    if (!db)
      return;

    expect(db).toBeDefined();
    var db2 = GetFirestore();
    expect(db).toEqual(db2);

    await db.collection("test").doc("1").set({
      here: true
    });

    var r = await db.collection("test").doc("1").get();
    expect(r.exists).toBeTruthy();
    var data = r.data();
    expect(data!.here).toBeTruthy();
  })

  it("chooses the right init pathway", async () => {
    await init("utilities");
    expect(GetFirestore()).toBeTruthy();
  })
})
