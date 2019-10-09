
import { Signup, Confirm, Unsubscribe } from './index'
import * as firestore from '../exchange/Firestore'

process.env.FIRESTORE_EMULATOR_HOST="localhost:8377"
firestore.init();

function isThisAManualTest() {
	return process.env.CI === "vscode-jest-tests";
}

test("Can sign up for email", async () => {

	// I don't want to spam myself, so only run this test if manually requested
	if (!isThisAManualTest())
		return;

	await Signup({
    email: "stephen.taylor.dev@gmail.com",
    confirmed: false,
  })
})

test("Can confirm existing email", async () => {
  var res = await Confirm({
    email: "stephen.taylor.dev@gmail.com",
    confirmed: true,
    firstName: "Stephen",
    city: "Montreal"
  });

  expect(res).toBeTruthy();
});

test("Cannot confim non-existent signup", async () => {
  expect(Confirm({
    email: "random@wew",
    confirmed: true,
  })).rejects.toThrow();
});

test("Can delete subscription", async () => {
  const email = "sets@dfvs.com";
  var s = await Signup({
    email,
    confirmed: false,
  })
  expect(s).toBeTruthy();
  var d = await Unsubscribe(email);
  expect(d).toBeTruthy();

  // allow unsubscribe non-existent emails
  var du = await Unsubscribe(email);
  expect(du).toBeTruthy();

  var dr = await Unsubscribe("sdfsdf");
  expect(dr).toBeTruthy();
});