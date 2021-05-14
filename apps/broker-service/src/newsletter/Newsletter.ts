import { SendWelcomeEmail } from "@thecointech/email";
import { log } from "@thecointech/logging";
import { getDetails, getDetailsByEmail, setDetails, deleteSubscription } from '@thecointech/broker-db/newsletter'
import { SubscriptionData, Subscription } from "@thecointech/broker-db/newsletter/types";
import { DateTime } from "luxon";

// Simple email validation is best.  Double opt-in guarantees correctness,
// and this string is stored raw (never operated on) so there is no risk of XSS etc.
const emailValid = /^\S+@\S+$/;
export function validateEmail(email: string) {
  return emailValid.test(email);
}

//
// Create a new subscription for email.
// If email already subscribed, do not create
// a new one, but do send the welcome email again.
// Return false for invalid data, else true
export async function signup(email: string) {
  // Check it email is OK
  if (!validateEmail(email)) {
    log.warn("Invalid email submitted: " + email);
    return null;
  }

  // Check if email is already here
  let sub = await getDetailsByEmail(email);
  if (sub) {
    log.debug({ SubId: sub.id }, `Email already subscribed under {SubId}`);
  }
  else {
    // Create new entry
    sub = {
      id: "",
      email,
      registerDate: DateTime.now()
    };
    sub.id = await setDetails(sub);
    log.trace({ SubId: sub.id }, `Registered new subscription with id {SubId}`);
  }

  // Try sending email
  if (!await SendWelcomeEmail(email, sub.id)) {
    log.error({ SubId: sub.id }, "Failed to send welcome email to {SubId}");
  }
  // Always successful (even if email sent had a problem, sub was still registered)
  return sub.id;
}

export async function update(id: string, details: SubscriptionData) : Promise<Subscription|undefined>
{
  // if existing, ensure we don't overwrite the signup time
  const sub = await getDetails(id);
  if (!sub)
    return undefined;

  // Keep the original registerDate
  const newDetails = {
    ...details,
    registerDate: sub.registerDate ?? DateTime.now(),
  }
  await setDetails(newDetails, id);
  return newDetails;
}

export async function unsubscribe(id: string)
{
  await deleteSubscription(id);
  return true;
}

export function details(id: string) : Promise<Subscription|undefined>
{
  return getDetails(id);
}
