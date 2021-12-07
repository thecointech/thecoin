import { accounts, contract } from '@openzeppelin/test-environment';
import { join } from 'path';
import { MINTER_ROLE, THECOIN_ROLE } from '../src/constants';
import { toNamedAccounts } from '../test-utils/accounts';
import { log } from '@thecointech/logging';
import { assignRoles } from './assignRoles';

// Global variables
jest.setTimeout(5 * 60 * 1000);
contract.artifactsDir = join(__dirname, "../src/contracts");
log.level(0);

//
// Simple sanity test for a contract
// deployed in development environment
it.skip('has assigned roles correctly', async () => {
  const named = toNamedAccounts(accounts);
  const TheCoin = contract.fromArtifact("TheCoin");
  const tcCore = await TheCoin.new();
  await tcCore.initialize(named.TheCoin);

  tcCore.connect = () => tcCore;
  await assignRoles(tcCore)
  // Are the roles assigned?
  const tc = await tcCore.getRoleMember(THECOIN_ROLE, 0);
  expect(tc).toEqual(named.TheCoin);
  const isMinter = await tcCore.hasRole(MINTER_ROLE, named.Minter);
  expect(isMinter).toBeTruthy();
});
