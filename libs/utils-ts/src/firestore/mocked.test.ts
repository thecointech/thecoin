import {init } from './mock'
import { GetFirestore } from './firestore';
import { Timestamp } from './timestamp';

beforeEach(() => {
  init({
    users: [
      { id: "abc123", name: "Homer Simpson" },
      { id: "abc456", name: "Lisa Simpson" },
    ],
    posts: [{ id: "123abc", title: "Really cool title" }],
  });
});


test('testing stuff', async () => {

  var db = GetFirestore();
  var userDocs = await db.collection('users').get();
  // write assertions here
  expect(userDocs.docs.length).toBe(2);

  // Have we correctly initialized a timestamp?
  var ts = Timestamp.now();
  expect(ts).toBeDefined();
})
