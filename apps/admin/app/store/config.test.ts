import { ConfigStore } from './config';
import PouchDB from 'pouchdb';

beforeAll(() => {
  PouchDB.plugin(require('pouchdb-adapter-memory'));
});

test("Can store KV pairs in Config", async () => {

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

test("Can create DB on disk", async () => {
  jest.setTimeout(5000);
  const test_prefix = '/temp/dbtest/';

  ConfigStore.initialize({
    prefix: test_prefix,
  });

  const key = 'key';

  await ConfigStore.set(key, "value");
  let val = await ConfigStore.get(key);
  expect(val).toBe('value');

  await ConfigStore.release();

  await expect(ConfigStore.get(key)).rejects.toThrow();

  ConfigStore.initialize({
    prefix: test_prefix,
  });

  val = await ConfigStore.get(key);
  expect(val).toBe('value');

  await ConfigStore.release();
});
