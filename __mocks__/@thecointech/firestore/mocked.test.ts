import { CollectionReference, isMockedDb } from '@thecointech/firestore';
//@ts-ignore
import { mockSet } from 'firestore-jest-mock/mocks/firestore';
import { getFirestore, init, Timestamp } from '.';
import data from './mock.data.json';

type DocData = {
  mutated: undefined|boolean,
} & typeof data['users'][0];

it ('creates mocked DB', async () => {

  init(data);

  const db = getFirestore();
  const userCollection = db.collection('users') as CollectionReference<DocData>;
  const userDocs = await userCollection.get();
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

  expect(mockSet).toBeCalled();

  // Have we correctly initialized a timestamp?
  const ts = Timestamp.now();
  expect(ts).toBeDefined();
})
