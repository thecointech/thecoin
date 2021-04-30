import { getFirestore, Timestamp } from "@thecointech/firestore";
import { decryptTo } from "@thecointech/utilities/Encrypt";
import { InstructionPacket } from "@thecointech/utilities/VerifiedAction";
import { log } from "@thecointech/logging";
import { getUserDoc } from "../user";
import { BaseEventType, CompletedEvent, SellAction, UserAction } from "./types";
import { DocumentReference } from "@thecointech/types";

//
// Access individual actions
//
export function getActionDoc(user: string, type: UserAction, id: string) {
	const userDoc = getUserDoc(user);
	return userDoc.collection(type).doc(id);
}

export async function getActionEvents(action: DocumentReference) {
  const events = await action.collection("events").get();
  return events.docs.map(doc => doc.data() as BaseEventType)
}

//
// Get incomplete action reference doc
//
export function getActionRef(type: UserAction, hash: string) {
  return getFirestore().collection(type).doc(hash);
}

//
// Get actions that have not yet completed.
//
export async function getUnsettledActions(type: UserAction) {
  const firestore = getFirestore()
  const collection = firestore.collection(type);
  const allDocs = await collection.get();
  const fetchAllBills = allDocs.docs.map(async (d) => {
    const path = d.get('ref');
    const billDocument = firestore.doc(path);
    const rawData = await billDocument.get();
    return rawData;
  });
  log.debug({action: type}, `Fetched ${fetchAllBills.length} actions of type: {action}`)
  return await Promise.all(fetchAllBills)
}

//
// Decrypt the actions' instruction packet
//
export function decryptInstructions(actions: SellAction[], privateKey: string) {
  return actions.map((action) => {
    const instructions = decryptTo<InstructionPacket>(privateKey, action.data.instructionPacket);
    return instructions;
  });
}

//
// Find user/action and complete it
//
// export async function completeAction(type: UserAction, action: DocumentReference) {

//   // Check that we got the right everything:
//   const user = GetSigner(action.data);
//   if (!user)
//     throw new Error("No user present");

//   await completeUserAction(user, type, action.data);
//   log.debug({action: type, hash: record.hash, address: user},
//     `Completed Certified {action} action for {address} with hash: {hash}`);
// }

//
// Complete this action.  Adds a completed event, and removes it from the
// list of unsettled actions
//
export async function completeAction(action: DocumentReference) {

  const data = await action.get();
  if (!data.exists)
    throw new Error("Oh No! You lost your AP");

  // TODO: reimplement
  // Ensure we only complete once filling in the appropriate data
  //const events = await getActionEvents(action);
  // if (!events.find(e => e.type === ) || !record.processedTimestamp)
  //   throw new Error("Missing required data: " + JSON.stringify(record));

  // Mark with the timestamp we finally finish this action
  const completedEvent : CompletedEvent = {
    type: "completed",
    timestamp: Timestamp.now(),
    data: ""
  }
  action.collection('events').add(completedEvent);

  // Find the ref in the uncomplete listing;
  // const ref = getActionRef(type, record.hash);
  // const deleteResults = await ref.delete();
  // if (deleteResults && !deleteResults.writeTime) {
  //   throw new Error("I feel like something should happen here")
  // }
}
