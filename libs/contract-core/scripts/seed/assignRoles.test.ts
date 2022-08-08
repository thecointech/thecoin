import { MINTER_ROLE, THECOIN_ROLE } from '../../src/constants';
import { toNamedAccounts } from '../../internal/accounts';
import { assignRoles } from './assignRoles';
import { ethers } from "hardhat";

// Global variables
jest.setTimeout(5 * 60 * 1000);

//
// Simple sanity test for a contract
// deployed in development environment
it('has assigned roles correctly', async () => {
  const signers = await ethers.getSigners();
  const named = toNamedAccounts(signers);
  const TheCoin = await ethers.getContractFactory("TheCoin", named.Owner);
  const tcCore = await TheCoin.deploy();
  await tcCore.initialize(named.TheCoin.address);

  await assignRoles(tcCore)
  // Are the roles assigned?
  const tc = await tcCore.getRoleMember(THECOIN_ROLE, 0);
  expect(tc).toEqual(named.TheCoin);
  const isMinter = await tcCore.hasRole(MINTER_ROLE, named.Minter.address);
  expect(isMinter).toBeTruthy();
});
