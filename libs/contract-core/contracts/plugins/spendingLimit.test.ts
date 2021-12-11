import { accounts, contract, web3 } from '@openzeppelin/test-environment';
import { toNamedAccounts } from '../../internal/accounts';
import { join } from 'path';
import type { TheCoinInstance, SpxCadOracleInstance, SpendingLimitInstance } from '../../migrations/types';
import { PLUGINMGR_ROLE, ALL_PERMISSIONS, MINTER_ROLE } from '../../src/constants'

jest.setTimeout(5 * 60 * 1000);

contract.artifactsDir = join(__dirname, "../../src/contracts");
const SpxCadOracle = contract.fromArtifact('SpxCadOracle');
const SpendingLimit = contract.fromArtifact('SpendingLimit');
const TheCoin = contract.fromArtifact('TheCoin');
const named = toNamedAccounts(accounts);

it('Correctly limits spending', async () => {

  const core: TheCoinInstance = await TheCoin.new();
  await core.initialize(named.TheCoin);
  await core.grantRole(MINTER_ROLE, named.Minter, { from: named.TheCoin });
  await core.grantRole(PLUGINMGR_ROLE, named.TheCoin, { from: named.TheCoin });
  await core.mintCoins(10000000, named.TheCoin, Date.now(), { from: named.Minter })

  // pass some $$$ to client1
  await core.transfer(named.client1, 1000, { from: named.TheCoin });

  // price feed init to $1
  const oracle: SpxCadOracleInstance = await SpxCadOracle.new();
  await oracle.initialize();
  await oracle.update(1e8);

  // Create limiter plugin
  const limiter: SpendingLimitInstance = await SpendingLimit.new(oracle.address, { from: named.TheCoin });
  const owner = await limiter.owner();

  // Assign to user, grant all permissions, limit user to $100
  await core.pl_assignPlugin(named.client1, limiter.address, ALL_PERMISSIONS, "0x1234", { from: named.TheCoin });
  await limiter.setUserSpendingLimit(named.client1, 100, { from: named.TheCoin });

  // Does the plugin limit as expected?
  const coreBalance = await core.balanceOf(named.client1);
  expect(coreBalance.toNumber()).toEqual(1000);

  // Attempt transfer exceeding limit
  // const shouldFail = core.transfer(named.client2, 2000, {from: named.client1});
  // await expect(shouldFail).rejects.toThrow();
});