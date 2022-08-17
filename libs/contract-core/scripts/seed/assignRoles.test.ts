import { jest } from '@jest/globals';
import { MINTER_ROLE, THECOIN_ROLE } from '../../src/constants';
import { assignRoles } from './assignRoles';
import { initAccounts } from '../../internal/initTest';
import hre from 'hardhat';

// Global variables
jest.setTimeout(5 * 60 * 1000);

//
// Simple sanity test for a contract
// deployed in development environment
it.skip('has assigned roles correctly', async () => {
  const signers = initAccounts(await hre.ethers.getSigners());
  const TheCoin = await hre.ethers.getContractFactory("TheCoin", signers.Owner);
  const tcCore = await TheCoin.deploy();
  await tcCore.initialize(signers.TheCoin.address);
  await assignRoles(tcCore)

  // Are the roles assigned?
  const tcRole = await tcCore.getRoleMember(THECOIN_ROLE, 0);
  expect(tcRole).toEqual(signers.TheCoin.address);
  const isMinter = await tcCore.hasRole(MINTER_ROLE, signers.Minter.address);
  expect(isMinter).toBeTruthy();
});
