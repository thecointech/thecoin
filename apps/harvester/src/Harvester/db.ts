import { HarvestData } from './types';
import pouchdb from 'pouchdb';
import electron from 'electron';
import { StoredData, fromDb, toDb } from './db_translate';
import path from 'path';
import { log } from '@thecointech/logging';

const db_path = path.join(electron.app.getPath('userData'), 'harvester.db');

let _harvester = null as unknown as PouchDB.Database<StoredData>;

export function initState(options?: { adapter: string }) {
  log.info(`Initializing state database at ${db_path}`);
  if (process.env.NODE_ENV === 'development') {
    options = {
      adapter: 'memory',
      ...options,
    }
  }
  if (!_harvester) {
    _harvester = new pouchdb<StoredData>(db_path, options);
  }
}

// We use pouchDB revisions to keep the prior state of documents
const StateKey = "state";

export async function getState() {
  try {
    return await _harvester.get(StateKey, { revs_info: true });
  }
  catch (err) {
    return undefined;
  }
}

export async function setCurrentState(data: HarvestData) {

  const lastState = await getState();
  await _harvester.put({
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
