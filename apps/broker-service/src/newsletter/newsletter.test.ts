
import { Signup, Confirm, Unsubscribe, SubDoc, numberOccurrencesEmail, Details } from './Newsletter'
import { init, describe } from '@the-coin/utilities/firestore/jestutils'
import { GetFirestore } from '@the-coin/utilities/firestore';

async function getDocId(email: string) {
  return (await SubDoc(email)).id;
}

describe('Test newsletter actions', () => {

  beforeAll(async () => {
    await init('broker-cad')
  });

  test("We have DB", async () => {
    let db = GetFirestore();
    expect(db).toBeTruthy();
  });

  //
  // Test email signup
  test("Can sign up for email", async () => {
    let email = "marie@thecoin.io";
    await Signup({
      email: email,
      confirmed: true,
    }, false)

    // Let's clean after
    const id = await getDocId(email);
    await Unsubscribe(id);
  });

  test("Can fetch details", async () => {
    let email = "marie@thecoin.io";
    await Signup({
      email: email,
      confirmed: true,
    }, false)

    const id = await getDocId(email);
    const details = await Details(id);
    //expect(details.email).toEqual(email);
    expect(details.id).toEqual(id);
    await Unsubscribe(id);
  });

  test("Cannot sign up more than once", async () => {

    let email = "marie@thecoin.io";
    await Signup({
      email,
      confirmed: true,
    }, false)

    email = "Marie@thecoin.io";
    await Signup({
      email,
      confirmed: true,
    }, false)

    email = "MARIE@thecoin.io";
    await Signup({
      email,
      confirmed: true,
    }, false)

    let numberOccurences = await numberOccurrencesEmail(email)
    expect(numberOccurences).toBe(1);

    // Let's clean after
    const id = await getDocId(email);
    await Unsubscribe(id);
  });


  test("Can confirm existing email", async () => {
    const email = "yiopieowyi@ghgyu.io";
    await (Signup({ email, confirmed: false, }, false));

    let res = await Confirm({
      id: await getDocId(email),
      email,
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
    let s = await Signup({
      email,
      confirmed: false,
    }, false)
    expect(s).toBeTruthy();
    const id = await getDocId(email);
    let d = await Unsubscribe(id);
    expect(d).toBeTruthy();

    // allow unsubscribe non-existent emails
    let du = await Unsubscribe(id);
    expect(du).toBeTruthy();

    let dr = await Unsubscribe("sdfsdf");
    expect(dr).toBeTruthy();
  });

})
