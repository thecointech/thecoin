import currency from 'currency.js'
import { DateTime } from 'luxon'
import { HarvestData, HarvestDelta } from './types.harvest'

export type StoredData = {
  date: string;
  visa: {
    balance: string;
    dueDate: string;
    dueAmount: string;
  };
  chq: {
    balance: string;
  };
  delta: Array<{
    harvesterBalance?: string;
    toETransfer?: string;
    toPayVisa?: string;
    toPayVisaDate?: string;
    stepData?: Record<string, string>;
  }>;
  state: {
    harvesterBalance?: string;
    toETransfer?: string;
    toPayVisa?: string;
    toPayVisaDate?: string;
    stepData?: Record<string, string>;
  };
};

export const toDb = (data: HarvestData) : StoredData => cleanseObject({
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
  // history: visa.history.map(toDbHistory),
})

const toDbChequing = (chq: HarvestData['chq']) => ({
  balance: chq.balance.toString(),
})

const toDbDelta = (delta: HarvestDelta) => ({
  harvesterBalance: delta.harvesterBalance?.toString(),
  toETransfer: delta.toETransfer?.toString(),
  toPayVisa: delta.toPayVisa?.toString(),
  toPayVisaDate: delta.toPayVisaDate?.toISO() ?? undefined,
  stepData: delta.stepData,
})

// const toDbHistory = (history: HarvestData['visa']['history'][number]) => ({
//   date: history.date.toISO()!,
//   description: history.description,
//   debit: history.debit?.toString(),
//   credit: history.credit?.toString(),
//   balance: history.balance?.toString(),
// })

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
  // history: data.history.map(fromDbHistory),
})

const fromDbChequing = (data: StoredData['chq']) => ({
  balance: new currency(data.balance),
})

const maybeCurrency = (v: string | undefined) => v ? new currency(v) : undefined;
const maybeDate = (v: string | undefined | null) => v ? DateTime.fromISO(v) : undefined;

const fromDbDelta = (data: StoredData['delta'][number]) => ({
  harvesterBalance: maybeCurrency(data.harvesterBalance),
  toETransfer: maybeCurrency(data.toETransfer),
  toPayVisa: maybeCurrency(data.toPayVisa),
  toPayVisaDate: maybeDate(data.toPayVisaDate),
  stepData: data.stepData,
})

// const fromDbHistory = (data: StoredData['visa']['history'][number]) => ({
//   date: DateTime.fromISO(data.date),
//   description: data.description,
//   debit: maybeCurrency(data.debit),
//   credit: maybeCurrency(data.credit),
//   balance: maybeCurrency(data.balance),
// })

// Remove all undefined parameters from the object recursively

function cleanseObject<T>(obj: T) {
  for (const [key, value] of Object.entries(obj as any)) {
    if (value === undefined || value == null) {
      delete (obj as any)[key]
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
