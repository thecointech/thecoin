import { getFirestore } from "@thecointech/firestore";
import { decryptTo } from "@thecointech/utilities/Encrypt";
import { InstructionPacket } from "@thecointech/utilities/VerifiedAction";
import { log } from "@thecointech/logging";
import { ActionType, ActionTypes, SellAction, TransitionDelta, TypedAction } from "./types";
import { DocumentReference } from "@thecointech/types";
import { getUserDoc } from "../user";
import { DateTime } from "luxon";

//
// Access individual actions
//
// export function getActionDoc(address: string, type: UserAction, firestoreId: string) {
// 	const userDoc = getUserDoc(address);
// 	return userDoc.collection(type).doc(firestoreId);
// }

// export async function findActionDoc(actions: CollectionReference, initialId: string) {
//   const matchingDocs = await actions
//     .where("initialId", "==", initialId)
//     .get();

//   if (matchingDocs.docs.length === 0)
//     return undefined;
//   if (matchingDocs.docs.length === 1)
//     return matchingDocs.docs[0].ref

//   log.error({initialId }, 'Multiple matching docs found for {initialId}');
//   throw new Error('Muliple docs for action');
// }

const HISTORY_KEY = "history";
const getIncompleteCollection = (type: ActionType) => getFirestore().collection(type);
const historyCollection = (action: DocumentReference) => action.collection(HISTORY_KEY);

//
// Create a new Action document and initialize with passed data.  Does not
// create any events.  Automatically registers incomplete ref for the new action
export async function createAction<Type extends ActionType>(address: string, type: Type, data: ActionTypes[Type]) : Promise<TypedAction<Type>> {
  // Wrapping these transactions in a batch ensures that there is no
  // chance a new action can be registered without it's matching incomplete ref
  var batch = getFirestore().batch();
  const doc = getUserDoc(address).collection(type).doc();
  batch.set(doc, data);

  // An incomplete ref is automatically created for every new action
  const incompleteRef = getIncompleteCollection(type).doc();
  batch.set(incompleteRef, {ref: doc.path});
  await batch.commit();
  return {
    data,
    history: [],
    doc,
  };
}

//
// Get event collection of single action, ordered by timestamp
export async function getActionHistory(action: DocumentReference) {
  const history = await historyCollection(action).get();
  return history.docs.map(doc => doc.data() as TransitionDelta)
}

export const storeTransition = (action: DocumentReference, transition: TransitionDelta) =>
  historyCollection(action).doc().set(transition);

//
// Return action data for the given path
export async function getAction<Type extends ActionType>(path: string) : Promise<TypedAction<Type>> {
  // get action doc
  const doc = getFirestore().doc(path);
  const snapshot = await doc.get();
  if (!snapshot.exists)
    throw new Error(`Action ${path} does not exist`);
  return {
    doc,
    data: snapshot.data() as ActionTypes[Type],
    history: await getActionHistory(doc)
  }
}


//
// Get incomplete action reference doc
//
// export function getIncompleteActionRef(type: UserAction, hash: string) {
//   return getFirestore().collection(type).doc(hash);
// }

//
// Get all actions of type that have not yet completed.
//
export async function getIncompleteActions<Type extends ActionType>(type: Type) {
  const allIncompleteOfType = await getIncompleteCollection(type).get();
  const fetchAll = allIncompleteOfType.docs.map(d => {
    const path = d.get('ref');
    return getAction<Type>(path);
  });
  log.debug({action: type}, `Fetched ${fetchAll.length} actions of type: {action}`)
  return await Promise.all(fetchAll)
}

//
// Decrypt the actions' instruction packet
//
export function decryptInstructions(actions: SellAction[], privateKey: string) {
  return actions.map((action) => {
    const instructions = decryptTo<InstructionPacket>(privateKey, action.data.initial.instructionPacket);
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
  if (!data.exists) {
    throw new Error(`Cannot complete non-existing action: ${action.path}`);
  }

  // Mark with the timestamp we finally finish this action
  const completedEvent : TransitionDelta = {
    type: "completed",
    timestamp: DateTime.now(),
  }
  historyCollection(action).add(completedEvent);

  throw new Error(`Finish this!`);
  // Find the ref in the uncomplete listing;
  // const ref = getActionRef(type, record.hash);
  // const deleteResults = await ref.delete();
  // if (deleteResults && !deleteResults.writeTime) {
  //   throw new Error("I feel like something should happen here")
  // }
}
