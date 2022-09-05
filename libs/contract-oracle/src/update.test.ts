
import { updateRates } from './update';
import { getContract } from './index_mocked';

////////////////////////////////////////////////////////////////////////////////////////
it('basic update functions', async () => {
  const oracle = getContract();
  const initial = (await oracle.INITIAL_TIMESTAMP()).toNumber();
  const blockTime = (await oracle.BLOCK_TIME()).toNumber();
  const factor = Math.pow(10, await oracle.decimals());
  const seconds = 365 * 24 * 60 * 60;
  const ratesFactory = (timestamp: number) => {
    const idx = (timestamp - initial) / blockTime;
    const from = timestamp - (timestamp % blockTime);
    return {
      rate: (idx * blockTime) / factor,
      from,
      to: from + blockTime,
    }
  }
  await updateRates(oracle, initial + seconds, ratesFactory);

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
