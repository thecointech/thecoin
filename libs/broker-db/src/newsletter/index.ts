import { getFirestore } from "@thecointech/firestore";
import { subscriptionConverter, Subscription } from "./types";

const getCollection = () => getFirestore().collection("newsletter").withConverter(subscriptionConverter);
const normalize = (email: string) => email.toLowerCase();

//
// Get details by Firestore ID
export async function getDetails(id: string) {
  return (await getCollection().doc(id).get()).data();
}

// Get details by email address
export async function getDetailsByEmail(email: string)
{
  const normalized = normalize(email);
  const collection = getCollection();
  const snapshot = await collection
                          .where('email', '==', normalized)
                          .get();
  return !snapshot.empty
    ? {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      }
      : undefined;
}

//
// Set/update subscription details
export async function setDetails(details: Subscription, id?: string) {
  details.email = normalize(details.email);
  const doc = getCollection().doc(id);
  await doc.set(details);
  return doc.id;
}

export function deleteSubscription(id: string) {
  return getCollection().doc(id).delete();
}
