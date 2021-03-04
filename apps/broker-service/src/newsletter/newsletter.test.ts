jest.mock('@the-coin/email');

import { SendWelcomeEmail } from '@the-coin/email';
import { mocked } from 'ts-jest/utils'
import { Signup, Update, Unsubscribe, Details } from './Newsletter'
import { init } from '@the-coin/utilities/firestore';

const mockedSend = mocked(SendWelcomeEmail);
mockedSend.mockReturnValue(Promise.resolve(true))

beforeEach(() => {
  jest.resetAllMocks();
  mockedSend.mockReturnValue(Promise.resolve(true))
  init({});
})

const RandomEmail = () => `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}@asdjflkj.co`;

//
// Test email signup
test("Can sign up for email", async () => {
  const email = RandomEmail();
  const id = await Signup(email)
  expect(mockedSend).toBeCalledWith(email, id);
  expect(id).toBeTruthy();
});

test("Can fetch details correctly", async () => {
  let email = RandomEmail();
  const id = await Signup(email)
  const details = await Details(id!);
  expect(details?.email).toEqual(email);
  // Fetch non-existent fails cleanly
  expect(await Details("asdfasdf")).toBeNull();
});

it("Ignores capitalization differences", async () => {

  const email = "marie@thecoin.io";
  const id1 = await Signup(email)

  const id2 = await Signup("Marie@thecoin.io");
  expect(id1).toEqual(id2);

  const id3 = await Signup("MARIE@thecoin.io")
  expect(id1).toEqual(id3);

  // However, we want to send an email each time
  expect(mockedSend).toBeCalledTimes(3);
});


test("Can confirm existing email", async () => {
  const email = RandomEmail();
  const id = await Signup(email);
  expect(id).toBeTruthy();

  let res = await Update(id!, {
    email,
    confirmed: true,
    givenName: "Stephen",
    city: "Montreal"
  });

  expect(res).toBeTruthy();
  expect(res?.confirmed).toBeTruthy();
  expect(res?.email).toBe(email);
});

test("Cannot confim non-existent signup", async () => {
  expect(Update("123456", {
    email: "random@wew",
    confirmed: true,
  })).rejects.toThrow();
});

test("Can delete subscription", async () => {
  const email = RandomEmail();
  let id = await Signup(email);
  expect(id).toBeTruthy();

  expect(await Unsubscribe(id!)).toBeTruthy();
  // Delete does not work with mocked DB
  //expect(await Details(id!)).toBeNull();

  // allow unsubscribe non-existent emails
  expect(await Unsubscribe(id!)).toBeTruthy();
  expect(await Unsubscribe("sdfsdf")).toBeTruthy();
});
