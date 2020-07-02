import { init, describe } from './jestutils';

describe('Our testing correctly connects to Firestore', ()=> {

  test("Status is valid", async () => {
    const db = await init('utilities');
    if (!db)
      return;

    expect(db).toBeDefined();

    await db.collection("test").doc("1").set({
      here: true
    });

    var r = await db.collection("test").doc("1").get();
    expect(r.exists).toBeTruthy();
    var data = r.data();
    expect(data!.here).toBeTruthy();
  })
})
