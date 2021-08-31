import { SendWelcomeEmail } from '@thecointech/email';
import { signup, update, details } from './Newsletter'
import { init } from '@thecointech/firestore';
import { log } from '@thecointech/logging';

beforeEach(() => {
  jest.resetAllMocks();
  init({});
  // disable logging
  log.level(100);
})

const RandomEmail = () => `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}@asdjflkj.co`;

//
// Test email signup
test("Can sign up for email", async () => {
  const email = RandomEmail();
  const id = await signup(email)
  expect(SendWelcomeEmail).toBeCalledWith(email, id);
  expect(id).toBeTruthy();
});

test("Can fetch details correctly", async () => {
  const email = RandomEmail();
  const id = await signup(email)
  // any ID will work
  const sub = await details(id!);
  expect(sub?.email).toEqual(email);
});

it("Can update existing email", async () => {
  const email = RandomEmail();
  const id = await signup(email);
  expect(id).toBeTruthy();

  let res = await update(id!, {
    email,
    confirmed: true,
    givenName: "Stephen",
    city: "Montreal"
  });

  expect(res).toBeTruthy();
  expect(res?.confirmed).toBeTruthy();
  expect(res?.email).toBe(email);
});

it("Cannot confim non-existent signup", async () => {
  const r = await update("123456", {
    email: "random@wew",
    confirmed: true,
  });
  expect(r).toBeFalsy();
})

it("Resends on repeated signup", async () => {

  const email = "marie@thecoin.io";
  await signup(email)
  await signup(email);
  await signup(email)
  // We should only
  // However, we want to send an email each time
  expect(SendWelcomeEmail).toBeCalledTimes(3);
});


