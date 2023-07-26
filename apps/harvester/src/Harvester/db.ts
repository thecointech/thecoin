import { HarvestData } from './types';
import pouchdb from 'pouchdb';
import { StoredData, fromDb, toDb } from './db_translate';
import path from 'path';
import { log } from '@thecointech/logging';
import { rootFolder } from '../paths';

const db_path = path.join(rootFolder, 'harvester.db');

export function initState(options?: { adapter: string }) {
  if (process.env.NODE_ENV === 'development') {
    log.info(`Initializing in-memory state database`);
    options = {
      adapter: 'memory',
      ...options,
    }
  }
  else {
    log.info(`Initializing state database at ${db_path}`);
  }
  return new pouchdb<StoredData>(db_path, options);
}
let _harvester = null as unknown as PouchDB.Database<StoredData>;

export const getDb = () => _harvester ??= initState();

// We use pouchDB revisions to keep the prior state of documents
const StateKey = "state";

export async function getState() {
  try {
    return await getDb().get(StateKey, { revs_info: true });
  }
  catch (err) {
    return undefined;
  }
}

export async function setCurrentState(data: HarvestData) {

  const lastState = await getState();
  await getDb().put({
    _id: StateKey,
    _rev: lastState?._rev,
    ...toDb(data),
  })
}

export async function getCurrentState() {
  const r = await getState();
  if (!r) {
    return undefined;
  }
  const {
    _id,
    _ref,
    _revs_info,
    ...state
  } = r;
  return fromDb(state);
}
