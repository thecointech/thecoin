import './setenv';
import { CollectionReference, DocumentReference, DocumentSnapshot, getFirestore, init } from '@thecointech/firestore';
import { writeFileSync } from 'fs';

async function dumpDocument(ref: DocumentReference) {
  const data = await ref.get();
  const r: any = {
    id: data.id,
    ...data.data(),
  }
  const allSubs = await ref.listCollections?.()!;
  if (allSubs.length > 0) {
    const dumpSubs = await Promise.all(allSubs.map(dumpCollection));
    r._collections = dumpSubs.reduce((acc: any, sub: any) => ({ ...acc, ...sub }), {} as any);
  }
  return r;
}
async function dumpCollection(coll: CollectionReference) {
  const allRefs = await coll.listDocuments?.()!;
  return { [coll.id]: await Promise.all(allRefs.map(dumpDocument)) };
}

async function dumpRoot() {
  const db = getFirestore();
  const allColls = await db.listCollections?.()!;
  const dumpSubs = await Promise.all(allColls.map(dumpCollection));
  return dumpSubs.reduce((acc: any, sub: any) => ({ ...acc, ...sub }), {} as any);
}

// Dump all data to disk in mocked format
async function dumpAll() {
  await init();

  const db = await dumpRoot();

  writeFileSync(`./dump-${process.env.CONFIG_NAME}.json`, JSON.stringify(db, null, '  '));
}

dumpAll();
