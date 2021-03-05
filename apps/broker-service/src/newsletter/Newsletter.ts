import { GetFirestore, Timestamp } from "@the-coin/utilities/firestore";
import { SendWelcomeEmail } from "@the-coin/email";
import { log } from "@the-coin/logging";
import { SubscriptionDetails } from "./types";

interface SubscriptionStore extends SubscriptionDetails {
  registerDate: Timestamp,
}

const GetCollection = () =>
  GetFirestore().collection("newsletter");

const GetById = (id: string) =>
  GetCollection().doc(id);

const Normalize = (email: string) => email.toLowerCase();

async function GetByEmail(email: string)
{
  const normalized = Normalize(email);
  const collection = GetCollection();
  const snapshot = await collection
                          .where('email', '==', normalized)
                          .get();
  return !snapshot.empty ?
    collection.doc(snapshot.docs[0].id) :
    null; // new empty document
}


export function validateEmail(email: string) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

//
// Create a new subscription for email.
// If email already subscribed, do not create
// a new one, but do send the welcome email again.
// Return false for invalid data, else true
export async function Signup(email: string) {
  // Check it email is OK
  if (!email || !validateEmail(email)) {
    log.warn("Invalid email submitted: " + email);
    return null;
  }
  // Check if email is already here
  let doc = await GetByEmail(email);
  if (doc?.id) {
    log.debug({ SubId: doc.id }, `Email already subscribed under {SubId}`);
  }
  else {
    // Create new entry
    doc = await GetCollection().add({
      email: Normalize(email),
      registerDate: Timestamp.now()
    });
    log.trace({ SubId: doc.id }, `Registered new subscription with id {SubId}`);
  }

  // TODO: What to do when sending failed?
  return await SendWelcomeEmail(email, doc.id)
    ? doc.id
    : null;
}

export async function Update(id: string, details: SubscriptionDetails) : Promise<SubscriptionDetails|null>
{
  if (!id)
    return null;

  // if existing, ensure we don't overwrite the signup time
  const doc = GetById(id);
  const existing = await doc.get();
  if (!existing.exists)
    return null;

  // Keep the original registerDate
  const newDetails = {
    ...details,
    registerDate: existing.data()?.registerDate,
  }
  await doc.set(newDetails)
  return details;
}

export async function Unsubscribe(id: string)
{
  const userDoc = GetById(id);
  await userDoc.delete();
  return true;
}

export async function Details(id: string) : Promise<SubscriptionDetails|null>
{
  const userDoc = GetById(id);
  const doc = await userDoc.get();
  if (doc.exists) {
    // Remove registerDate from the data
    const { registerDate, ...rest} = doc.data() as SubscriptionStore;
    return rest;
  }
  return null;
}
