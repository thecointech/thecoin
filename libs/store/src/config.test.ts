import { ConfigStore } from './config';
import PouchDB from 'pouchdb';

beforeAll(() => {
  PouchDB.plugin(require('pouchdb-adapter-memory'));
});

it("Can store KV pairs in Config", async () => {

  ConfigStore.initialize({
    adapter: "memory",
    prefix: undefined,
  });

  const key = 'key';
  let val = await ConfigStore.get(key);
  expect(val).not.toBeDefined();

  await ConfigStore.set(key, "value");
  val = await ConfigStore.get(key);
  expect(val).toBe('value');

  await ConfigStore.set(key, 'changed');
  val = await ConfigStore.get(key);
  expect(val).toBe('changed');

  await ConfigStore.set('other', 'other');
  val = await ConfigStore.get('other');
  expect(val).toBe('other');

  await ConfigStore.release();
});
