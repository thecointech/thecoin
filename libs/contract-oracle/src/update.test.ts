import { jest } from '@jest/globals';
import { describe, IsManualRun } from '@thecointech/jestutils';
import { updateRates } from './update';
import { createOracle } from '../internal/testHelpers';
import hre from 'hardhat';
import '@nomiclabs/hardhat-ethers';

jest.setTimeout(120 * 1000);

////////////////////////////////////////////////////////////////////////////////////////
describe('Really long & old test', () => {
  it('basic update functions', async () => {
    const [owner] = await hre.ethers.getSigners();
    const oracle = await createOracle(owner, 366);
    const initial = (await oracle.INITIAL_TIMESTAMP()).toNumber();
    const blockTime = (await oracle.BLOCK_TIME()).toNumber();
    const factor = Math.pow(10, await oracle.decimals());
    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
    const ratesFactory = async (timestamp: number) => {
      const idx = (timestamp - initial) / blockTime;
      const from = timestamp - (timestamp % blockTime);
      return {
        rate: (idx * blockTime) / factor,
        from,
        to: from + blockTime,
      }
    }
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
