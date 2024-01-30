import { jest } from '@jest/globals';
import { describe, IsManualRun } from '@thecointech/jestutils';
import { updateRates } from './update';
import { createOracle } from '../internal/testHelpers';
import { SpxCadOracleMocked } from './index_mocked';
import hre from 'hardhat';
import '@nomiclabs/hardhat-ethers';
import { DateTime } from 'luxon';
import { SpxCadOracle } from './codegen';
import { log } from '@thecointech/logging';

jest.setTimeout(120 * 1000);

////////////////////////////////////////////////////////////////////////////////////////
describe('Really long & old test', () => {
  it('basic update functions', async () => {
    const [owner] = await hre.ethers.getSigners();
    const oracle = await createOracle(owner, 366);
    const initial = (await oracle.INITIAL_TIMESTAMP()).toNumber();
    const blockTime = (await oracle.BLOCK_TIME()).toNumber();
    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

    const ratesFactory = await getRatesFactory(oracle);
    await updateRates(oracle, initial + oneYearInMs, ratesFactory);

    const runTest = async (timestamp: number) => {
      const exp = Math.floor(timestamp / blockTime) * blockTime;
      const r1 = await oracle.getRoundFromTimestamp(initial + timestamp);
      expect(r1.toNumber()).toEqual(exp);
    }

    await runTest(0);
    await runTest(3 * 60 * 60);
    await runTest(3600);
    await runTest(364 * 24 * 60 * 60);
  });
}, IsManualRun)

it('handles daylight savings changes', async () => {

  const start = DateTime.fromISO('2023-07-27T07:31:30', { zone: 'America/Winnipeg' });
  const till = DateTime.fromISO('2024-01-24T13:53', { zone: 'America/Winnipeg' });
  const blocktime = 24 * 60 * 60 * 1000;
  const mocked = new SpxCadOracleMocked();
  const DSTStart = DateTime.fromISO('2023-03-12T02:00', { zone: 'America/Winnipeg' });
  mocked.initialize('', start.toMillis(), blocktime);
  mocked.updateOffset({ from: DSTStart.toMillis(), offset: -(60 * 60 * 1000) })
  const ratesFactory = await getRatesFactory(mocked);
  await updateRates(mocked as unknown as SpxCadOracle, till.toMillis(), ratesFactory);

  // This should only put in a single additional)
  expect(mocked.offsets.length).toEqual(2);
})

it ('Handles lengthening a block', async () => {
  const { oracle, rates } = await generateSimpleOracle([
    24,
    23,
    24,
    25,
    24,
  ], false)

  await updateSimpleRates(oracle, rates);
  await validateResults(oracle, rates);
})

it ('handles shortening a block', async () => {
  const { oracle, rates } = await generateSimpleOracle([
    24,
    25,
    24,
    23,
    24,
  ], false)

  await updateSimpleRates(oracle, rates);
  await validateResults(oracle, rates);
})

it ('Handles random offsets JS', async () => {
  // Disable logging
  log.level("fatal")
  const start = DateTime.fromISO('2023-06-27T12:00:00');
  const mocked = new SpxCadOracleMocked();
  const blocktime = 24 * 60 * 60 * 1000;
  mocked.initialize('', start.toMillis(), blocktime);

  await updateSimpleRates(mocked, rates);

  const factor = Math.pow(10, await mocked.decimals());
  const oInit = await mocked.getRoundFromTimestamp(start.toMillis());
  expect(oInit.toNumber()).toEqual(1 * factor);

  await validateResults(mocked, rates);
})

it ('Handles random offsets SOL', async () => {
  // Disable logging
  log.level("fatal")
  const start = DateTime.fromISO('2023-06-27T12:00:00');
  const [owner] = await hre.ethers.getSigners();
  const daysAgo = DateTime.now().diff(start, 'days').toObject().days;
  const oracle = await createOracle(owner, daysAgo);

  await updateSimpleRates(oracle, rates);

  const factor = Math.pow(10, await oracle.decimals());
  const oInit = await oracle.getRoundFromTimestamp(start.toMillis());
  expect(oInit.toNumber()).toEqual(1 * factor);

  await validateResults(oracle, rates);
})

const getRatesFactory = async (oracle: SpxCadOracleMocked|SpxCadOracle) => {
  const initial = (await oracle.INITIAL_TIMESTAMP()).toNumber();
  const blockTime = (await oracle.BLOCK_TIME()).toNumber();
  const factor = Math.pow(10, await oracle.decimals());

  return async (timestamp: number) => {
    const from = DateTime.fromMillis(timestamp);
    const to = from.plus({ day: 1 });
    const idx = (timestamp - initial) / blockTime;
    return {
      rate: (idx * blockTime) / factor,
      from: timestamp,
      to: to.toMillis(),
    }
  }
}

const createSimpleOracleSol = async (requiredDays: number) => {
  const [owner] = await hre.ethers.getSigners();
  const oracle = await createOracle(owner, requiredDays);
  return oracle
}
const createSimpleOracleJs = async () => new SpxCadOracleMocked();

const createSimpleOracle = async (requiredDays: number, asJs?: boolean) =>
  asJs ? createSimpleOracleJs() : createSimpleOracleSol(requiredDays);

const generateSimpleOracle = async (hours: number[], asJs?: boolean) => {
  const requiredDays = 1 + hours.reduce((a, b) => a + b, 0) / 24
  const oracle = await createSimpleOracle(requiredDays, asJs)
  // const mocked = new SpxCadOracleMocked();
  const start = DateTime.fromMillis((await oracle.INITIAL_TIMESTAMP()).toNumber());
  const rates = []
  let from = start;
  for (let i = 0; i < hours.length; i++) {
    const to = from.plus({ hour: hours[i] });
    rates.push({
      rate: i + 1,
      from,
      to,
    })
    from = to;
  }
  return { oracle, rates };
}

const updateSimpleRates = (mocked: SpxCadOracleMocked|SpxCadOracle, rates: any[]) => (
  updateRates(mocked as any, Date.now(),
    async (millis: number) => {
      for (let i = 0; i < rates.length; i++) {
        if (millis < rates[i].to.toMillis()) {
          return {
            rate: rates[i].rate,
            from: rates[i].from.toMillis(),
            to: rates[i].to.toMillis(),
          }
        }
      }
      return undefined
    })
  )

const validateResults = async (mocked: SpxCadOracleMocked|SpxCadOracle, rates: any[]) => {
  const factor = Math.pow(10, await mocked.decimals());
  for (const r of rates) {
    const oStart = await mocked.getRoundFromTimestamp(r.from.toMillis());
    expect(oStart.toNumber()).toEqual(r.rate * factor);
    const oTo = await mocked.getRoundFromTimestamp(r.to.toMillis() - 1);
    expect(oTo.toNumber()).toEqual(r.rate * factor);
  }
}

const rates = [
  { // Block 0-30: Much-to-short
    rate: 1,
    from: DateTime.fromISO('2023-07-27T12:00:00'),
    to: DateTime.fromISO('2023-07-28T05:37:16'),
  },
  { // Blocks 31-33: Over several days
    rate: 2,
    from: DateTime.fromISO('2023-07-28T05:37:16'),
    to: DateTime.fromISO('2023-07-31T02:55:20'),
  },
  { // Back to regular timing
    rate: 3,
    from: DateTime.fromISO('2023-07-31T02:55:20'),
    to: DateTime.fromISO('2023-08-01T12:00:00'),
  },
  {
    // Several days + later
    rate: 4,
    from: DateTime.fromISO('2023-08-01T12:00:00'),
    to: DateTime.fromISO('2023-08-04T17:10:00'),
  },
  {
    // Several days + earlier
    rate: 5,
    from: DateTime.fromISO('2023-08-04T17:10:00'),
    to: DateTime.fromISO('2023-08-07T04:00:00'),
  },
  {
    // One day, + later
    rate: 6,
    from: DateTime.fromISO('2023-08-07T04:00:00'),
    to: DateTime.fromISO('2023-08-08T23:55:00'),
  },
  {
    // One day, + earlier
    rate: 7,
    from: DateTime.fromISO('2023-08-08T23:55:00'),
    to: DateTime.fromISO('2023-08-09T00:05:00'),
  }
]
