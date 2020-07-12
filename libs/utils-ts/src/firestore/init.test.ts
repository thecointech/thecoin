jest.mock("./debug");
jest.mock("./server");

import { init as init_db, describe } from './jestutils';
import { GetFirestore, init } from '.';
import { init as init_debug } from './debug';
import { init as init_server } from './server';


describe('Our testing correctly connects to Firestore', () => {

  test("Status is valid", async () => {
    const db = await init_db('utilities');
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
    expect(init_debug).toBeCalled();

    process.env["GAE_ENV"] = "someval";
    await init("utilities");
    expect(init_server).toBeCalled();

    //expect(GetFirestore()).toBeTruthy();
  })
})
