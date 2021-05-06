import { getFirestore } from "@thecointech/firestore";
import { log } from "@thecointech/logging";
import { ActionType, ActionTypes, TransitionDelta, TypedAction } from "./types";
import { DocumentReference, DocumentSnapshot } from "@thecointech/types";
import { getUserDoc } from "../user";
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

//
// Add transition to this action history
export const storeTransition = (action: DocumentReference, transition: TransitionDelta) =>
  historyCollection(action).add(transition);

//
// Return action data for the given path
export async function getAction<Type extends ActionType>(type: Type, path: string): Promise<TypedAction<Type>> {
  // get action doc
  const doc = getFirestore().doc(path);
  const snapshot = await doc.get();
  if (!snapshot.exists)
    throw new Error(`Action ${path} does not exist`);
  return toAction(type, snapshot)
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
      const action = await toAction<Type>(type, query.docs[0]);
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

//
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
    type,
  };
}

//
// Convert firestore action document to full action type, including history
const toAction = async <Type extends ActionType>(type: Type, snapshot: DocumentSnapshot) => ({
  doc: snapshot.ref,
  data: snapshot.data() as ActionTypes[Type],
  history: await getActionHistory(snapshot.ref),
  type,
})

//
// Get all actions of type that have not yet completed.
export async function getIncompleteActions<Type extends ActionType>(type: Type) {
  const allIncompleteOfType = await getIncompleteCollection(type).get();
  const fetchAll = allIncompleteOfType.docs.map(d => {
    const path = d.get('ref');
    return getAction(type, path);
  });
  log.debug({ action: type }, `Fetched ${fetchAll.length} actions of type: {action}`)
  return await Promise.all(fetchAll)
}

//
// Complete this action.  Adds a completed event, and removes it from the
// list of unsettled actions
export async function removeIncomplete(type: ActionType, path: string) {
  // Find the ref in the uncomplete listing and delete it
  const collection = getIncompleteCollection(type);
  const snapshot = await collection
    .where("ref", "==", path)
    .get();

  // mocked db does not implement 'where' clause, so manually filter here so tests pass
  let docs = snapshot.docs;
  if (process.env.NODE_ENV === 'test') {
    docs = docs.filter(d => d.get('ref') == path);
  }

  if (docs.length > 1) {
    throw new Error(`Multiple incomplete refs found with path ${path}`);
  }
  if (docs.length == 1) {
    await collection.doc(docs[0].id).delete();
  }
}
