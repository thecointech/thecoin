import { DateTime } from 'luxon';
import { HarvestData, HarvestDelta } from './types';
import pouchdb from 'pouchdb';
import currency from 'currency.js';

type StoredData = ReturnType<typeof toDb>;
let _harvester = null as unknown as PouchDB.Database<StoredData>;

export function initState(options?: { adapter: string }) {
  if (!_harvester) {
    _harvester = new pouchdb<StoredData>('harvester', options);
  }
}

// We use pouchDB revisions to keep the prior state of documents
const StateKey = "state";

export async function getLastState() {
  try {
    const r = await _harvester.get(StateKey, { revs_info: true });
    return {
      ...r,
      ...fromDb(r),
    };
  }
  catch (err) {
    return undefined;
  }
}

export async function setCurrentState(data: HarvestData) {

  const lastState = await getLastState();
  await _harvester.put({
    _id: StateKey,
    _rev: lastState?._rev,
    ...toDb(data),
  })
}

////////////////////////////////////////////////////////////////////////////////

export const toDb = (data: HarvestData) => cleanseObject({
  date: data.date.toISO()!,

  visa: toDbVisa(data.visa),
  chq: toDbChequing(data.chq),

  delta: data.delta.map(toDbDelta),
  state: toDbDelta(data.state),
})

const toDbVisa = (visa: HarvestData['visa']) => ({
  balance: visa.balance.toString(),
  dueDate: visa.dueDate.toISO()!,
  dueAmount: visa.dueAmount.toString(),
  history: visa.history.map(toDbHistory),
})

const toDbChequing = (chq: HarvestData['chq']) => ({
  balance: chq.balance.toString(),
})

const toDbDelta = (delta: HarvestDelta) => ({
  harvesterBalance: delta.harvesterBalance?.toString(),
  toETransfer: delta.toETransfer?.toString(),
  toPayVisa: delta.toPayVisa?.toString(),
  stepData: delta.stepData,
})

const toDbHistory = (history: HarvestData['visa']['history'][number]) => ({
  date: history.date.toISO()!,
  description: history.description,
  debit: history.debit?.toString(),
  credit: history.credit?.toString(),
  balance: history.balance?.toString(),
})

////////////////////////////////////////////////////////////////////////////////

export const fromDb = (data: StoredData) : HarvestData => ({
  date: DateTime.fromISO(data.date),
  visa: fromDbVisa(data.visa),
  chq: fromDbChequing(data.chq),
  delta: data.delta.map(fromDbDelta),
  state: fromDbDelta(data.state),
})

const fromDbVisa = (data: StoredData['visa']) => ({
  balance: new currency(data.balance),
  dueDate: DateTime.fromISO(data.dueDate),
  dueAmount: new currency(data.dueAmount),
  history: data.history.map(fromDbHistory),
})

const fromDbChequing = (data: StoredData['chq']) => ({
  balance: new currency(data.balance),
})

const maybeCurrency = (v: string | undefined) => v ? new currency(v) : undefined;

const fromDbDelta = (data: StoredData['delta'][number]) => ({
  harvesterBalance: maybeCurrency(data.harvesterBalance),
  toETransfer: maybeCurrency(data.toETransfer),
  toPayVisa: maybeCurrency(data.toPayVisa),
  stepData: data.stepData,
})

const fromDbHistory = (data: StoredData['visa']['history'][number]) => ({
  date: DateTime.fromISO(data.date),
  description: data.description,
  debit: maybeCurrency(data.debit),
  credit: maybeCurrency(data.credit),
  balance: maybeCurrency(data.balance),
})

// Remove all undefined parameters from the object recursively

function cleanseObject(obj: any) {
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value == null) {
      delete obj[key]
    }
    else if (DateTime.isDateTime(value) || (value as any).intValue) {
      // do nothing
    }
    else if (typeof value === 'object') {
      cleanseObject(value)
      // if (!Object.keys(value!).length) delete obj[key]
    }
  }
  return obj
}
