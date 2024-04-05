import { HarvestData } from './types';
import pouchdb from 'pouchdb';
import { StoredData, fromDb, toDb } from './db_translate';
import path from 'path';
import { log } from '@thecointech/logging';
import { rootFolder } from '../paths';
import currency from 'currency.js';
import { DateTime } from 'luxon';

const db_path = path.join(rootFolder, 'harvester.db');

function initState(options?: { adapter: string }) {
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
let __harvester = null as unknown as PouchDB.Database<StoredData>;

export const getDb = () => __harvester ??= initState();

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
    _rev,
    _revs_info,
    ...state
  } = r;
  return fromDb(state);
}

// Override the harvesters current balance
export async function setOverrides(balance: number, pendingAmount: number, pendingDate: string|null|undefined) {
  log.warn(`Overriding harvester balance: ${balance}, pending amount: ${pendingAmount}, pending date: ${pendingDate}`);
  const current = await getCurrentState();
  if (current != null) {
    const pendingOverride = pendingAmount > 0 && pendingDate != null
      ? {
        toPayVisa: currency(pendingAmount),
        toPayVisaDate: DateTime.fromISO(pendingDate),
      }
      : {};
    await setCurrentState({
      ...current,
      state: {
        ...current.state,
        harvesterBalance: currency(balance),
        ...pendingOverride,
      },
      delta: [
        ...current.delta,
        {
          harvesterBalance: currency(balance),
          ...pendingOverride,
        }
      ]
    });
  }

  else {
    await setCurrentState({
      chq: {
        balance: currency(0), // What to put here?
      },
      visa: {
        balance: currency(0),
        dueAmount: currency(0),
        dueDate: DateTime.fromMillis(0),
        history: [],
      },
      date: DateTime.now(),
      delta: [{
        harvesterBalance: currency(balance),
      }],
      state: {
        harvesterBalance: currency(balance),
      }
    });
  }
  return true;
}

// Export all results as CSV string
export async function exportResults() {
  try {
    const db = getDb();
    const r = await db.get("state", { revs_info: true });
    const raw = await Promise.all(
      r._revs_info?.map(r => db.get("state", { rev: r.rev })) ?? []
    );
    raw.reverse();
    const allLines = [];
    let priorState: any = {};
    for (const r of raw) {
      allLines.push(parseLine(priorState, r));
      priorState = r.state;
    }
    return [
      getHeader(),
      ...allLines,
    ].join('\n')
  }
  catch (err) {
    return JSON.stringify(err);
  }
}

const getHeader = () => [
  'Date',
  'Chq Balance',
  'Visa Balance',
  'Visa Due Amount',
  'Visa Due Date',
  'Harvester Balance',
  'to ETransfer',
  'To Pay Visa',
  'To Pay Visa Date',
  'State StepData',
].join(',');

const cleanObj = (obj?: object) => JSON.stringify(obj)?.replace(',', ';')

export function parseLine(prior: StoredData['state'], line: StoredData) {

  const lines: string[] = [
    parseAll(line, prior),
  ];
  line.delta.reduce((prior, curr) => {
    const r = {
      ...prior,
      ...curr
    }
    lines.push(parseAll(undefined, curr));
    return r;
  }, prior);
  return lines.join('\n');
}

function parseInputs(r?: StoredData) {
  return [
    r?.date,
    r?.chq.balance,
    r?.visa.balance,
    r?.visa.dueAmount,
    r?.visa.dueDate,
  ];
}

function parseState(r?: StoredData['state']) {
  return [
    r?.harvesterBalance,
    r?.toETransfer,
    r?.toPayVisa,
    r?.toPayVisaDate,
    cleanObj(r?.stepData),
  ];
}

const parseAll = (state?: StoredData, delta?: StoredData['state']) => [
  ...parseInputs(state),
  ...parseState(delta),
].join(',');
