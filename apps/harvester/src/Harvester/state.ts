import { log } from '@thecointech/logging';
import { rootFolder } from '../paths';
import currency from 'currency.js';
import { DateTime } from 'luxon';
import { PayVisaKey } from './steps/PayVisa';
import { StateDatabase } from '@thecointech/store-harvester';
import type { HarvestData, HarvestDelta } from './types';

// const db_path = path.join(rootFolder, `harvester${dbSuffix()}.db`);
const db = new StateDatabase(rootFolder);

export async function setCurrentState(data: HarvestData) {
  return await db.set(data);
}

export async function getRawState() {
  return await db.raw();
}
export async function getCurrentState() {
  return await db.get();
}

// Override the harvesters current balance
export async function setOverrides(balance: number, pendingAmount: number|null, pendingDate: string|null|undefined) {
  log.warn(`Overriding harvester balance: ${balance}, pending amount: ${pendingAmount}, pending date: ${pendingDate}`);

  const pendingOverride = pendingAmount != null && pendingDate != null
  ? {
    toPayVisa: currency(pendingAmount),
    toPayVisaDate: DateTime.fromISO(pendingDate),
    stepData: {
      [PayVisaKey]: pendingDate,
    }
  }
  : {};

  const current = (await getCurrentState()) ?? {
    chq: {
      balance: currency(0), // What to put here?
    },
    visa: {
      balance: currency(0),
      dueAmount: currency(0),
      dueDate: DateTime.fromMillis(0),
      history: [],
    },
    coin: BigInt(0),
    date: DateTime.now(),
    state: {},
    delta: [],
  };

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

  return true;
}

// Export all results as CSV string
export async function exportResults() {
  const all = await db.getAll();
  all.reverse();
  const allLines = [];
  let priorState: any = {};
  for (const r of all) {
    allLines.push(parseLine(priorState, r));
    priorState = r.state;
  }
  return [
    getHeader(),
    ...allLines,
  ].join('\n')
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

export function parseLine(prior: HarvestDelta, line: HarvestData) {

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

function parseInputs(r?: HarvestData) {
  return [
    r?.date,
    r?.chq.balance,
    r?.visa.balance,
    r?.visa.dueAmount,
    r?.visa.dueDate,
  ];
}

function parseState(r?: HarvestDelta) {
  return [
    r?.harvesterBalance,
    r?.toETransfer,
    r?.toPayVisa,
    r?.toPayVisaDate,
    cleanObj(r?.stepData),
  ];
}

const parseAll = (state?: HarvestData, delta?: HarvestDelta) => [
  ...parseInputs(state),
  ...parseState(delta),
].join(',');
