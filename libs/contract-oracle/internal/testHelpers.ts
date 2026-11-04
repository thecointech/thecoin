import { DateTime, Duration } from 'luxon';
import { getOracleFactory } from '../src/contract';
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";
import type { SpxCadOracle } from '../src';

export async function createOracle(owner: SignerWithAddress, daysAgo = 6, blockTime?: number) {
  const SpxCadOracle = getOracleFactory(owner);
  const oracle = await SpxCadOracle.deploy();

  // We start our time 6 days ago at midnight with a day-long rate length
  const initialTime = DateTime
    .now()
    .set({hour:0, minute:0, second:0, millisecond:0})
    .minus({days: daysAgo})
    .toMillis();

  const bt = blockTime ?? Duration.fromObject({day: 1}).as("milliseconds");
  await oracle.initialize(owner.address, initialTime, bt);
  (oracle as any).__blockTime = bt;
  (oracle as any).__initialTime = initialTime;

  return oracle;
}

export async function createAndInitOracle(owner: SignerWithAddress, rate = 2, blockTime?: number, daysAgo = 6) {
  const oracle = await createOracle(owner, daysAgo, blockTime);
  // Push a constant rate covering the last week, valid until at
  // least tonight midnight NY (ie, 00:00 tomorrow).  We cannot
  // just push 7 entries:
  // blocks are fixed-length in millis, so when the week spans a
  // DST transition the wall-clock span can be 1hr longer than
  // 7 * blockTime and the last hour before midnight is uncovered.
  const initialTime = (oracle as any).__initialTime;
  const target = DateTime
    .now()
    .set({hour:0, minute:0, second:0, millisecond:0})
    .plus({days: 1})
    .toMillis();
  // setOracleValueRepeat takes its duration in days (and does
  // its own conversion to block count), so express the target
  // span as a fractional number of days.
  const dayInMs = Duration.fromObject({day: 1}).as("milliseconds");
  const daysToCover = (target - initialTime) / dayInMs;
  // bulkUpdate rejects pushes whose validity would extend more
  // than one block past the current chain time, so when blockTime
  // is shorter than the span remaining until midnight the target
  // is unreachable in a single update.  Limit the span to what
  // the contract will accept; coverage still reaches the target
  // whenever blockTime permits.
  const bt = (oracle as any).__blockTime;
  // (the -1ms margin ensures rounding inside setOracleValueRepeat
  // cannot push the count back over maxEntries)
  const maxEntries = Math.floor((Number(await oracle.msNow()) + bt - initialTime) / bt);
  const daysAllowed = (maxEntries * bt - 1) / dayInMs;
  await setOracleValueRepeat(oracle, rate, Math.min(daysToCover, daysAllowed));
  return oracle;
}

export async function setOracleValueRepeat(oracle: SpxCadOracle, rate: number, days: number) {
  const bt = (oracle as any).__blockTime;
  const numEntries = Math.ceil(days / Duration.fromMillis(bt).as("days"));
  const tx = await oracle.bulkUpdate(new Array(numEntries).fill(Math.round(rate * 1e8)));
  return await tx.wait();
}
