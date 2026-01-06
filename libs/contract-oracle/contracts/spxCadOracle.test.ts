import { jest } from '@jest/globals';
import { last } from '@thecointech/utilities/ArrayExtns';
import { describe } from '@thecointech/jestutils';
import { updateRates } from '../src/update';
import { ContractOracle } from '../mocks/oracle_mocked';
import { getOracleFactory } from '../src';
import hre from 'hardhat';
import '@nomicfoundation/hardhat-ethers';
import { existsSync, readFileSync } from 'fs';
import { DateTime, Duration } from 'luxon';
import { createAndInitOracle } from '../internal/testHelpers';

jest.setTimeout(5 * 60 * 1000);
const factor = Math.pow(10, 8);
const blockTime = 3 * 60 * 60 * 1000;
const [owner] = await hre.ethers.getSigners();
const ratesFiles = new URL('../../../data/rates.json', import.meta.url);
const shouldRun = existsSync(ratesFiles);

describe('Oracle Tests', () => {
  ////////////////////////////////////////////////////////////////////////////////////////
  // Here we duplicate the solidity functions into JS
  // so we can run them quickly & completely.  If putting
  // this on the blockchain it'll take minutes for each test.
  it("it can find rate in JS version", async () => {

    const { rates, factory } = await getRatesFactory();
    // ignore the first live rate, since there are some issues with the first day
    const initialTimestamp = rates[0].from;
    const oracle = await ContractOracle.connect(owner);
    await oracle.initialize(owner.address, initialTimestamp, blockTime);
    const till = Math.min(last(rates).to, Date.now());
    await updateRates(oracle, till, factory);

    // Now, test every single rates to prove it's consistent
    for (const r of rates) {
      const test = async (t: number) => {
        const s = await oracle.getRoundFromTimestamp(t);
        const expected = Math.round(r.rate * factor);
        expect(Number(s)).toEqual(expected);
      }
      const from = r.from;
      const to = Math.min(r.to, Date.now());

      test(from);
      test(to - 1);
      const duration = to - from;
      for (let i = 0; i < 3; i++) {
        const t = Math.floor(Math.random() * duration);
        test(from + t);
      }
    }
  })

  ////////////////////////////////////////////////////////////////////////////////////////
  // Here we test the deployment & a few iterations
  // this ensures that the basics work, and that our
  // algo matches the JS version tested above
  it("it can find rate in SOL version", async () => {
    const SpxCadOracle = getOracleFactory(owner);
    const oracle = await SpxCadOracle.deploy();

    // ignore the first live rate, since there are some issues with the first day
    // Choose ~300 entries, this should always catch one DST changeover
    const { rates, factory } = await getRatesFactory();
    const start = Math.floor(Math.random() * (rates.length - 301));
    const initialTimestamp = rates[start].from;
    const till = rates[start + 300].to;

    await oracle.initialize(owner.address, initialTimestamp, blockTime);
    await updateRates(oracle, till, factory);

    // Now, test every single rates to prove it's consistent
    for (const r of rates.slice(start, start + 300)) {
      const test = async (t: number) => {
        const s = await oracle.getRoundFromTimestamp(t);
        const expected = Math.round(r.rate * factor);
        expect(Number(s)).toEqual(expected);
      }
      await test(r.from);
      await test(r.to - 1);
      const duration = r.to - r.from;
      for (let i = 0; i < 3; i++) {
        const t = Math.floor(Math.random() * duration);
        await test(r.from + t);
      }
    }
  })
}, shouldRun)

it ("Does not add too many rates", async () => {
  const SpxCadOracle = await hre.ethers.getContractFactory('SpxCadOracle');
  const oracle = await SpxCadOracle.deploy();
  const now = DateTime.now();
  const initialTimestamp = now.minus({ weeks: 1, minutes: 1 }).toMillis();
  const blockTime = Duration.fromObject({ hours: 24 }).toMillis();
  await oracle.initialize(owner.address, initialTimestamp, blockTime);

  const toInsert = Array(6).fill(100);
  await oracle.bulkUpdate(toInsert);

  const firstValid = (await oracle.validUntil());
  // This should fail.
  await expect(oracle.bulkUpdate(toInsert))
    .rejects.toThrow();

  const secondValid = (await oracle.validUntil());
  expect (secondValid).toEqual(firstValid);

  await oracle.updateOffset({from: now.toMillis(), offset: -(65 * 60 * 1000)});

  // But we still should be able to push two more updates?
  await oracle.bulkUpdate(toInsert.slice(0, 2));
  const lastValid = (await oracle.validUntil());
  expect(lastValid).toBeGreaterThanOrEqual(Date.now());
})

it ("Can reset to point-in-time", async () => {
  const [owner] = await hre.ethers.getSigners();
  const oracle = await createAndInitOracle(owner, 2, blockTime, 100);
  const initial = Number(await oracle.INITIAL_TIMESTAMP());
  const validUntil = Number(await oracle.validUntil());
  // Add some offsets evenly spaced in the time
  for (let i = 1; i < 10; i++) {
    const from = initial + (validUntil - initial) * (i / 10);
    await oracle.updateOffset({from: from, offset: -(60 * 60 * 1000)});
  }

  // Cache current values
  const preRates = await oracle.getRates();
  const preOffsets = await oracle.getOffsets();

  // Clear half the values
  const middle = initial + (validUntil - initial) / 2;
  await oracle.resetTo(middle);

  // get new values
  const postRates = await oracle.getRates();
  const postOffsets = await oracle.getOffsets();

  const postValid = (await oracle.validUntil());
  expect(postValid).toBeGreaterThan(middle);
  expect(postValid).toBeLessThan(middle + blockTime);

  for (let i = 0; i < preOffsets.length; i++) {
    if (i < postOffsets.length) {
      expect(preOffsets[i].from).toBeLessThanOrEqual(middle);
    }
    else {
      expect(preOffsets[i].from).toBeGreaterThan(middle);
    }
  }
})

type LiveRate = {
  from: number,
  to: number,
  rate: number,
}
async function getRatesFactory() {
  const rawRates = readFileSync(ratesFiles, 'utf-8');
  const liveRates  = JSON.parse(rawRates).rates as LiveRate[];
  const rates = liveRates.slice(8);
  const factory = async (millis: number) => {
    for (let i = 0; i < rates.length; i++) {
      if (rates[i].to > millis) {
        const r = {
          ...rates[i]
        }
        const nextRate = rates[i + 1];
        if (nextRate) {
          if (nextRate.from != r.to) {
            r.to = nextRate.from;
          }
        }
        else if (r.to > millis) {
          // If it's the last rate, limit it's duration to blocktime
          // Otherwise it breaks testing over the weekend (normally
          // the validity of the currency field limits the duration
          // to a max of blocktime, but this files values are squished)
          return {
            ...r,
            from: millis,
            to: millis + blockTime
          }
        }
        return r;
      }
    }
    return null;
  }
  return { rates, factory };
}
