
import { Signup, Confirm, Unsubscribe, SubDoc, numberOccurrencesEmail } from './Newsletter'
import { init, describe } from '../../../../libs/utils-ts/src/firestore/debug'

beforeAll(async () => {
  await init()
});

async function getDocId(email: string) {
  return (await SubDoc(email)).id;
}

describe('Test newsletter actions', () => {

  //
  // Test email signup
  test("Can sign up for email", async () => {
    var email = "marie@thecoin.io";
    await Signup({
      email: email,
      confirmed: true,
    }, false)

    // Let's clean after
    const id = await getDocId(email);
    await Unsubscribe(id);
  });

  test("Cannot sign up more than once", async () => {

    var email = "marie@thecoin.io";
    await Signup({
      email: email,
      confirmed: true,
    }, false)

    var email = "Marie@thecoin.io";
    await Signup({
      email: email,
      confirmed: true,
    }, false)

    var email = "MARIE@thecoin.io";
    await Signup({
      email: email,
      confirmed: true,
    }, false)

    var numberOccurences = await numberOccurrencesEmail(email)
    expect(numberOccurences).toBe(1);

    // Let's clean after
    const id = await getDocId(email);
    await Unsubscribe(id);
  });


  test("Can confirm existing email", async () => {
    const email = "yiopieowyi@ghgyu.io";
    await (Signup({ email, confirmed: false, }, false));

    var res = await Confirm({
      id: await getDocId(email),
      confirmed: true,
      firstName: "Stephen",
      city: "Montreal"
    });

    expect(res).toBeTruthy();
    expect(res!.confirmed).toBeTruthy();
    expect(res!.email).toBe(email);

    // Let's clean after
    const id = await getDocId(email);
    await Unsubscribe(id);
  });

  test("Cannot confim non-existent signup", async () => {
    expect(Confirm({
      id: "123456",
      email: "random@wew",
      confirmed: true,
    })).rejects.toThrow();
  });

  test("Can delete subscription", async () => {
    const email = "sets@dfvs.com";
    var s = await Signup({
      email,
      confirmed: false,
    }, false)
    expect(s).toBeTruthy();
    const id = await getDocId(email);
    var d = await Unsubscribe(id);
    expect(d).toBeTruthy();

    // allow unsubscribe non-existent emails
    var du = await Unsubscribe(id);
    expect(du).toBeTruthy();

    var dr = await Unsubscribe("sdfsdf");
    expect(dr).toBeTruthy();
  });

})
