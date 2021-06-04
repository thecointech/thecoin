import { DocumentData, FirestoreDataConverter, toDateTime, toTimestamp } from "@thecointech/firestore";
import { Decimal } from "decimal.js-light";
import { isPlainObject } from 'lodash';

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
    fromFirestore(snapshot: DocumentData): T {
      return converters.reduce((obj, cv) => convertObject(obj, cv.keys, cv.fromFirestore), snapshot.data());
    }
  }
}