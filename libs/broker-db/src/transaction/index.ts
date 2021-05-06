import { getFirestore } from "@thecointech/firestore";
import { decryptTo } from "@thecointech/utilities/Encrypt";
import { InstructionPacket } from "@thecointech/utilities/VerifiedAction";
import { log } from "@thecointech/logging";
import { ActionType, ActionTypes, SellAction, TransitionDelta, TypedAction } from "./types";
import { DocumentReference, DocumentSnapshot } from "@thecointech/types";
import { getUserDoc } from "../user";
import { DateTime } from "luxon";
import equal from "fast-deep-equal/es6";


const HISTORY_KEY = "history";
const getIncompleteCollection = (type: ActionType) => getFirestore().collection(type);
const historyCollection = (action: DocumentReference) => action.collection(HISTORY_KEY);

//
// Get event collection of single action, ordered by timestamp
export async function getActionHistory(action: DocumentReference) {
  const history = await historyCollection(action).get();
  return history.docs.map(doc => doc.data() as TransitionDelta)
}

export const storeTransition = (action: DocumentReference, transition: TransitionDelta) =>
  historyCollection(action).add(transition);

//
// Return action data for the given path
export async function getAction<Type extends ActionType>(path: string): Promise<TypedAction<Type>> {
  // get action doc
  const doc = getFirestore().doc(path);
  const snapshot = await doc.get();
  if (!snapshot.exists)
    throw new Error(`Action ${path} does not exist`);
  return toAction<Type>(snapshot)
}

//
// Find an action for user addres with initialId
export async function getActionFromInitial<Type extends ActionType>(address: string, type: Type, initial: ActionTypes[Type]): Promise<TypedAction<Type>> {
  const typeCollection = getUserDoc(address).collection(type);
  const query = await typeCollection
    .where("initialId", "==", initial.initialId)
    .get();

  switch (query.size) {
    case 0:
      return createAction(address, type, initial);
    case 1:
      const action = await toAction<Type>(query.docs[0]);
      // Assert equivalency
      assertSame(action.data.timestamp, initial.timestamp);
      assertSame(action.data.initial, initial.initial);
      return action;
    default:
      log.fatal({ intialId: initial.initialId, type, address },
        'Duplicate {type} initialId {initialId} found for {address}');
      throw new Error(`Found duplicate actions`);
  }
}

function assertSame<T>(data: T, initial: T) {
  if (!equal(data, initial))
    throw new Error(`Initial data ${data} does not match queried data ${initial}`);
}

// Create a new Action document and initialize with passed data.  Does not
// create any events.  Automatically registers incomplete ref for the new action
export async function createAction<Type extends ActionType>(address: string, type: Type, data: ActionTypes[Type]): Promise<TypedAction<Type>> {
  const doc = getUserDoc(address).collection(type).doc();
  // An incomplete ref is automatically created for every new action
  const incompleteRef = getIncompleteCollection(type).doc();

  // Wrapping these transactions in a batch ensures that there is no
  // chance a new action can be registered without it's matching incomplete ref
  await getFirestore().batch()
    .set(doc, data)
    .set(incompleteRef, { ref: doc.path })
    .commit();

  return {
    data,
    history: [],
    doc,
  };
}

const toAction = async <Type extends ActionType>(snapshot: DocumentSnapshot) => ({
  doc: snapshot.ref,
  data: snapshot.data() as ActionTypes[Type],
  history: await getActionHistory(snapshot.ref)
})

//
// Get all actions of type that have not yet completed.
//
export async function getIncompleteActions<Type extends ActionType>(type: Type) {
  const allIncompleteOfType = await getIncompleteCollection(type).get();
  const fetchAll = allIncompleteOfType.docs.map(d => {
    const path = d.get('ref');
    return getAction<Type>(path);
  });
  log.debug({ action: type }, `Fetched ${fetchAll.length} actions of type: {action}`)
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
// Complete this action.  Adds a completed event, and removes it from the
// list of unsettled actions
//
export async function completeAction(action: DocumentReference) {

  const data = await action.get();
  if (!data.exists) {
    throw new Error(`Cannot complete non-existing action: ${action.path}`);
  }

  // Mark with the timestamp we finally finish this action
  const completedEvent: TransitionDelta = {
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
