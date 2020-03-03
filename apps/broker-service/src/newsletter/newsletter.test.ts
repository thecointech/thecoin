
import { Signup, Confirm, Unsubscribe, SubDoc } from './Newsletter'
import * as firestore from '../exchange/Firestore'

process.env.FIRESTORE_EMULATOR_HOST="localhost:8377"
firestore.init();

async function getDocId(email: string) {
  return (await SubDoc(email)).id;
}

test("Can sign up for email", async () => {

	// I don't want to spam myself, so only run this test if manually requested
	// if (!isThisAManualTest())
	// 	return;

	await Signup({
    email: "MaQiiE@thecoin.io",
    confirmed: true,
  }, false)
});

test("Can confirm existing email", async () => {
  const email = "1@thecoin.io";
  await (Signup({ email, confirmed: false,}, false));
  
  var res = await Confirm({
    id: await getDocId(email),
    confirmed: true,
    firstName: "Stephen",
    city: "Montreal"
  });

  expect(res).toBeTruthy();
  expect(res!.confirmed).toBeTruthy();
  expect(res!.email).toBe(email);
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