import { DocumentData, FirestoreDataConverter, toDateTime, toTimestamp } from "@thecointech/firestore";

// Helper function converts to/from datastore, with DateTime/Timestamp conversion
export function buildConverter<T>(dtKeys: (keyof T)[]=[]) : FirestoreDataConverter<T> {
  return {
    toFirestore(data: T) {
      const r: DocumentData = {...data};
      dtKeys.forEach(k => {
        const ks = k as string;
        if (r[ks])
          r[ks] = toTimestamp(r[ks])]
      });
      return r
    },
    fromFirestore(snapshot: DocumentData): T {
      const r = {...snapshot.data()};
      dtKeys.forEach(k => {
        if (r[k])
          r[k] = toDateTime(r[k]);
      });
      return r as T;
    }
  }
}
