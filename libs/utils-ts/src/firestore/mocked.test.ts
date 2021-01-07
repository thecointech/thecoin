import {init } from './mock'
import { GetFirestore } from './firestore';
import { Timestamp } from './timestamp';
import data from './mock.data.json';

test('basic creation', async () => {

  init(data);

  var db = GetFirestore();
  const userCollection = db.collection('users');
  var userDocs = await db.collection('users').get();
  // write assertions here
  expect(userDocs.docs.length).toBe(2);

  const doc = userDocs.docs[0];
  expect(doc.id).toBe("abc123");
  expect(doc.data().name).toBe("Homer Simpson");

  // does mutability work?
  await userCollection.doc(doc.id).set({
    ...doc.data(),
    mutated: true,
  });

  // Have we correctly initialized a timestamp?
  var ts = Timestamp.now();
  expect(ts).toBeDefined();
})

test('immutability', async () => {

  init(data, true);

  var db = GetFirestore();

  // assert that mutations throw
  const shouldThrow = () => db.collection('users').doc('any').set({
    mutated: true
  });
  return expect(shouldThrow()).rejects.toThrowError("Error: read-only test attempting to modify database");
})
