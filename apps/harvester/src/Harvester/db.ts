import currency from 'currency.js';
import { DateTime } from 'luxon';
import { ConfigShape } from './config';
import { HarvestData } from './types';
import pouchdb from 'pouchdb';


let _harvester = null as unknown as PouchDB.Database<HarvestData>;
let _config = null as unknown as PouchDB.Database<ConfigShape>;

export function initialize(options?: { adapter: string }) {
  _harvester = new pouchdb<HarvestData>('harvester', options);
  _config = new pouchdb<ConfigShape>('config', options);
}

// We use pouchDB revisions to keep the prior state of documents
const StateKey = "state";
const ConfigKey = "config";

export async function getLastState() {
  try {
    return await _harvester.get(StateKey, { revs_info: true });
  }
  catch (err) {
    return undefined;
  }
}

export async function setCurrentState(data: HarvestData) {

  const lastState = await getLastState();
  await _harvester.put({
    _id: StateKey,
    _rev: lastState?._rev,
    ...data,
  })
}

