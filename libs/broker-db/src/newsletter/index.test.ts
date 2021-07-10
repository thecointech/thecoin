import { init } from "@thecointech/firestore";
import { DateTime } from "luxon";
import { getDetails, getDetailsByEmail, setDetails } from ".";
import { Subscription } from "./types";

beforeEach(() => {
  init({});
})

const details: Subscription = {
  email: "123@asdf",
  registerDate: DateTime.now(),
};

it('sets details', async () => {
  const id = await setDetails(details);
  const newDetails = await getDetails(id);
  expect(newDetails?.email).toEqual(details.email);
})

it("Removes capitalization", async () => {
  const id = await setDetails({
    email: "MARIE@THECOIN.io",
    registerDate: DateTime.now(),
  });
  const newDetails = await getDetails(id);
  expect(newDetails?.email).toEqual("marie@thecoin.io");
});

// Note, this doesn't test the actual 'where' clause
// (mock cannot do that)
it("Get by email works", async () => {
  const id = await setDetails(details);
  const newDetails = await getDetailsByEmail(details.email);
  expect(newDetails?.id).toEqual(id);
});

it("Can register muliple details", async () => {
  const id1 = await setDetails(details);
  details.givenName = "John";
  const id2 = await setDetails(details, id1);
  expect(id1).toEqual(id2);
  const newDetails = await getDetails(id2);
  expect(newDetails?.givenName).toEqual("John");
});
