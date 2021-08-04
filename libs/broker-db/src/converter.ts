import { DocumentData, FirestoreDataConverter, Timestamp, FieldValue, QueryDocumentSnapshot } from "@thecointech/firestore";
import { Decimal } from "decimal.js-light";
import { isPlainObject } from 'lodash';
import { DateTime } from 'luxon';


const toTimestamp = (d?: DateTime) =>
  d
    ? Timestamp.fromMillis(d.toMillis())
    : d;
const toDateTime = (d?: Timestamp) =>
  d
    ? DateTime.fromMillis(d.toMillis())
    : d;


function convertObject(obj: DocumentData, keys: string[], converter: (v: any) => any) {
  // do a deep clone
  const r = { ...obj };
  Object.keys(obj).forEach(k => {
    if (keys.includes(k)) {
      r[k] = converter(obj[k]);
    }
    else if (isPlainObject(obj[k])) {
      r[k] = convertObject(obj[k], keys, converter);
    }
  })
  return r;
}
type converter = {
  toFirestore: (v: any) => any;
  fromFirestore: (v: any) => any;
  keys: string[];
};

export function serverTimestamp<T>(...keys: (keyof T)[]) {
  return {
    toFirestore: () => FieldValue.serverTimestamp(),
    fromFirestore: toDateTime,
    keys,
  }
}
export function convertDates<T>(...keys: (keyof T)[]) {
  return {
    toFirestore: toTimestamp,
    fromFirestore: toDateTime,
    keys,
  }
}
export function convertDecimal<T>(...keys: (keyof T)[]) {
  return {
    toFirestore: (d: Decimal) => d.toNumber(),
    fromFirestore: (n: number) => new Decimal(n),
    keys,
  }
}


// Helper function converts to/from datastore, with DateTime/Timestamp conversion
export function buildConverter<T>(...converters: converter[]): FirestoreDataConverter<T> {
  return {
    toFirestore(data: T) {
      return converters.reduce((obj, cv) => convertObject(obj, cv.keys, cv.toFirestore), data as DocumentData);
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      return converters.reduce((obj, cv) => convertObject(obj, cv.keys, cv.fromFirestore), snapshot.data()) as T;
    }
  }
}
