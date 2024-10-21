import { getFirestore, DocumentReference, DocumentSnapshot, FirestoreDataConverter } from "@thecointech/firestore";
import { log } from "@thecointech/logging";
import { ActionType, ActionDataTypes, TransitionDelta, TypedAction, AnyActionData, ActionDictionary } from "./types";
import { getUserDoc } from "../user";
import equal from "fast-deep-equal/es6/index.js";
import { actionConverters, incompleteConverter, transitionConverter } from "./converters";

const incompleteCollection = (type: ActionType) => getFirestore().collection(type).withConverter(incompleteConverter);
const historyCollection = (action: DocumentReference<AnyActionData>) => action.collection("History").withConverter(transitionConverter);
const userActionCollection = <Type extends ActionType>(address: string, type: Type) => getUserDoc(address).collection(type).withConverter(actionConverters[type] as FirestoreDataConverter<ActionDataTypes[Type]>)


async function getHistory(action: DocumentReference<AnyActionData>) {
  const history = await historyCollection(action).get();
  return [...history.docs]
    .sort((a, b) => a.data().created.toMillis() - b.data().created.toMillis())
}

//
// Get event collection of single action, ordered by timestamp
export async function getActionHistory(action: DocumentReference<AnyActionData>) {
  const history = await getHistory(action);
  return history.map(doc => doc.data());
}

// Update the i-th transition.  (Hopefully will never be used)
type TransitionData = Omit<TransitionDelta, "created"|"type">
export async function updateTransition(action: DocumentReference<AnyActionData>, index: number, update: TransitionData) {
  const history = await getHistory(action);
  // Update apparently doesn't do conversions on-the-fly
  const converted = transitionConverter.toFirestore(update as any);
  return await historyCollection(action)
    .doc(history[index].id)
    .update(converted);
}

//
// Add transition to this action history
export function storeTransition(action: DocumentReference<AnyActionData>, transition: TransitionDelta) {
  return historyCollection(action).add(transition);
}

////////////////////////////////////////////////////////////////////
export const getActionDoc = <Type extends ActionType>(address: string, type: Type, id?: string) =>
  id
    ? userActionCollection(address, type).doc(id)
    : userActionCollection(address, type).doc();

//
// Return action data for the action by type/firestore id
export async function getAction<Type extends ActionType>(address: string, type: Type, id: string): Promise<TypedAction<Type>> {
  // get action doc
  const doc = getActionDoc(address, type, id);
  const snapshot = await doc.get();
  if (!snapshot.exists)
    throw new Error(`Action ${doc.path} does not exist`);
  return toAction(address, type, snapshot)
}

//
// Find an action for user address with initialId
export async function getActionFromInitial<Type extends ActionType>(address: string, type: Type, initial: ActionDataTypes[Type]): Promise<TypedAction<Type>> {
  const typeCollection = userActionCollection(address, type);
  const query = await typeCollection
    .where("initialId", "==", initial.initialId)
    .get();

  switch (query.size) {
    case 0:
      return createAction(address, type, initial);
    case 1:
      const action = await toAction(address, type, query.docs[0]);
      // Assert equivalency
      assertSame(action.data.date, initial.date);
      assertSame(action.data.initial, initial.initial);
      return action;
    default:
      log.fatal({ intialId: initial.initialId, type, address },
        'Duplicate {type} initialId {initialId} found for {address}');
      throw new Error(`Found duplicate actions`);
  }
}

//
// Gets all actions (complete & incomplete) of type for user address
export async function getActionsForAddress<Type extends ActionType>(address: string, type: Type) {
  const actionRefs = await userActionCollection(address, type).get();
  const actions = await Promise.all([...actionRefs.docs].map(d => toAction(address, type, d)));
  return actions.sort((a, b) => a.data.date.toMillis() - b.data.date.toMillis());
}

//
// Gets all actions (complete & incomplete) of type for users
export async function getAllActionsOfType<Type extends ActionType>(addresses: string[], type: Type) {
  const r: ActionDictionary<Type> = {};
  for (const address of addresses) {
    r[address] = await getActionsForAddress(address, type)
  }
  return r;
}

//
// Get all actions for the passed users
export async function getAllActions(addresses: string[]) {
  return {
    Buy: await getAllActionsOfType(addresses, "Buy"),
    Sell: await getAllActionsOfType(addresses, "Sell"),
    Bill: await getAllActionsOfType(addresses, "Bill"),
    Plugin: await getAllActionsOfType(addresses, "Plugin"),
  }
}

// test deep equality.
function assertSame<T>(data: T, initial: T) {
  if (!equal(data, initial))
    throw new Error(`Initial data ${data} does not match queried data ${initial}`);
}

//
// Create a new Action document and initialize with passed data.  Does not
// create any events.  Automatically registers incomplete ref for the new action
export async function createAction<Type extends ActionType>(address: string, type: Type, data: ActionDataTypes[Type]): Promise<TypedAction<Type>> {
  const doc = getActionDoc(address, type);
  // An incomplete ref is automatically created for every new action
  const incompleteRef = incompleteCollection(type).doc();

  // Wrapping these transactions in a batch ensures that there is no
  // chance a new action can be registered without it's matching incomplete ref
  await getFirestore().batch()
    .set(doc, data)
    .set(incompleteRef, { ref: doc as any })
    .commit();

  return {
    address,
    data,
    history: [],
    doc,
    type,
  };
}

//
// Convert firestore action document to full action type, including history
const toAction = async <Type extends ActionType>(address: string, type: Type, snapshot: DocumentSnapshot<ActionDataTypes[Type]>) => ({
  address,
  doc: snapshot.ref,
  data: snapshot.data()!,
  history: await getActionHistory(snapshot.ref as any),
  type,
})

// Decompose a path to an action into /address/type/id
function decomposeActionPath(path: string|DocumentReference) {
  // Split into components
  const asDoc = (typeof path == "string")
    ? getFirestore().doc(path)
    : path;
  const id = asDoc.id;
  const type = asDoc.parent.id;
  const address = asDoc.parent.parent?.id;
  if (!address)
    throw new Error(`Referenced document does not include parent`);
  return {
    id,
    address,
    type,
  }
}

//
// Get all actions of type that have not yet completed.
export async function getIncompleteActions<Type extends ActionType>(type: Type) {
  const allIncompleteOfType = await incompleteCollection(type).get();
  const fetchAll = [...allIncompleteOfType.docs].map(d => {
    const path = d.get('ref');
    const { address, id } = decomposeActionPath(path);
    return getAction(address, type, id);
  });
  log.debug({ action: type, length: fetchAll.length }, 'Fetched {length} actions of type: {action}')
  const all = await Promise.all(fetchAll);
  // ensure actions are sorted by date
  all.sort((a, b) => a.data.date.toMillis() - b.data.date.toMillis());
  return all
}

//
// Complete this action.  Adds a completed event, and removes it from the
// list of unsettled actions
export async function removeIncomplete(type: ActionType, doc: DocumentReference) {
  // Find the ref in the uncomplete listing and delete it
  const collection = incompleteCollection(type);
  const snapshot = await collection
    .where("ref", "==", doc)
    .get();

  // mocked db does not implement 'where' clause, so manually filter here so tests pass
  let docs = [...snapshot.docs];
  if (process.env.CONFIG_NAME === 'development') {
    docs = docs.filter(d => d.get('ref') == doc);
  }

  switch(docs.length) {
    case 0:
      log.warn({ action: type, path: doc.path }, `No records found when removing incomplete {action} action with path: {path}`)
      break;
    case 1:
      log.debug({ action: type, path: doc.path }, `Marking {action} action complete for path: {path}`)
      await docs[0].ref.delete();
      break;
    default:
      log.error({ action: type, path: doc.path }, `Multiple incomplete {action} actions found with path {path}`);
      // Do not delete multiples
      throw new Error(`removeIncomplete failed`)
  }
}
