import { jest } from '@jest/globals';
import hre from 'hardhat';
import { createAndInitOracle } from '@thecointech/contract-oracle/testHelpers.ts';
import { getPluginLogs, updateState } from './logs';
import { DateTime } from 'luxon';
import { RoundNumber } from '../types';

jest.setTimeout(30 * 1000);

it ('fetches logs for ', async () => {
  const {owner, contract} = await deployContract()
  await setRoundPoint(contract, 50e2, DateTime.now());
  const logs = await getPluginLogs(contract.address, owner.address, contract.provider, 0);
  expect(logs.length).toBe(1);
  expect(logs[0].amnt.toNumber()).toBe(50e2);
  expect(logs[0].path).toBe("UserRounding[user]");
  expect(logs[0].user).toBe(owner.address);
  expect(logs[0].timestamp.diffNow("seconds").seconds).toBeGreaterThan(-5);
})

it ('updates state correctly', async () => {
  const {owner, contract} = await deployContract()
  await setRoundPoint(contract, 50e2);
  const logs = await getPluginLogs(contract.address, owner.address, contract.provider, 0);
  const state: any = {}
  updateState(state, DateTime.now(), logs);
  expect(state.UserRounding[owner.address].toNumber()).toEqual(50e2);
})

it ('applies logs correctly across time', async () => {
  const {owner, contract} = await deployContract()
  const points = [
    50e2,
    200e2,
    150e2,
  ];
  for (let i = 0; i < points.length; i++) {
    await setRoundPoint(contract, points[i], daysAgo(points.length - i));
  }

  const logs = await getPluginLogs(contract.address, owner.address, contract.provider, 0);
  const state: any = {}

  // Prior update changes nothing
  updateState(state, daysAgo(points.length + 1), logs);
  expect(state.UserRounding).toBeUndefined();

  for (let i = 0; i < points.length; i++) {
    updateState(state, daysAgo(points.length - i), logs);
    expect(state.UserRounding[owner.address].toNumber()).toEqual(points[i]);
  }
})

const daysAgo = (days: number) => DateTime.now().minus({days})

async function deployContract() {
  const [owner] = await hre.ethers.getSigners()
  const oracle = await createAndInitOracle(owner);
  const RoundNumber = await hre.ethers.getContractFactory('RoundNumber');
  const contract = await RoundNumber.deploy(oracle.address);
  return {owner, contract};
}

async function setRoundPoint(contract: RoundNumber, roundPoint: number, timestamp?: DateTime) {
  // Change default roundPoint
  const timestampSec = Math.round(
    (timestamp ?? DateTime.now().minus({seconds: 30})).toSeconds()
  )
  const r = await contract.setRoundPoint(roundPoint, timestampSec);
  await r.wait();
}
