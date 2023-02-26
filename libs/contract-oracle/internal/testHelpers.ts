import { DateTime, Duration } from 'luxon';
import { getOracleFactory } from '../src/contract';
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { SpxCadOracle } from '../src';

export async function createAndInitOracle(owner: SignerWithAddress, rate = 2) {
  const SpxCadOracle = getOracleFactory(owner);
  const oracle = await SpxCadOracle.deploy();
  // We start our time 6 days ago at midnight with a day-long rate length
  const initialTime = DateTime
    .now()
    .set({hour:0, minute:0, second:0, millisecond:0})
    .minus({days: 6})
    .toMillis();
  const blockTime = Duration.fromObject({day: 1}).as("milliseconds");
  await oracle.initialize(owner.address, initialTime, blockTime);
  // We a constant rate over the last week, expires tonight midnight
  await setOracleValueRepeat(oracle, rate, 7);
  return oracle;
}

export async function setOracleValueRepeat(oracle: SpxCadOracle, rate: number, days: number) {
  const tx = await oracle.bulkUpdate(new Array(days).fill(rate * 1e8));
  return await tx.wait();
}
