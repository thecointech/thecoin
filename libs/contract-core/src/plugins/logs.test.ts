import { jest } from '@jest/globals';
import hre from 'hardhat';
import { createAndInitOracle } from '@thecointech/contract-oracle/testHelpers.ts';
import { getPluginLogs, updateState } from './logs';
import { DateTime } from 'luxon';

jest.setTimeout(30 * 1000);

it ('fetches logs for ', async () => {
  const {owner, contract} = await setRoundPoint()

  const logs = await getPluginLogs(contract.address, owner.address, contract.provider, 0);
  expect(logs.length).toBe(1);
  expect(logs[0].amnt.toNumber()).toBe(50e2);
  expect(logs[0].path).toBe("UserRounding[user]");
  expect(logs[0].user).toBe(owner.address);
  expect(logs[0].date.diffNow("seconds").seconds).toBeGreaterThan(-30);
})

it ('updates state correctly', async () => {
  const {owner, contract} = await setRoundPoint()
  // Let the function complete...?
  const logs = await getPluginLogs(contract.address, owner.address, contract.provider, 0);
  const state: any = {}
  updateState(state, DateTime.fromSeconds(0), DateTime.now().plus({seconds: 100}), logs);
  expect(state.UserRounding[owner.address].toNumber()).toEqual(50e2);
})

async function setRoundPoint() {
  const [owner] = await hre.ethers.getSigners()
  const oracle = await createAndInitOracle(owner);
  const RoundNumber = await hre.ethers.getContractFactory('RoundNumber');
  const contract = await RoundNumber.deploy(oracle.address);

  // Change default roundPoint
  const r = await contract.setRoundPoint(50e2);
  await r.wait();

  return { owner, contract}
}
