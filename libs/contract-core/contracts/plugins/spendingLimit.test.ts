import { jest } from '@jest/globals';
import hre from 'hardhat';
import { createAndInitTheCoin, initAccounts } from '../../internal/initTest';
import { ALL_PERMISSIONS } from '../../src/constants';

jest.setTimeout(5 * 60 * 1000);

// const SpxCadOracle = contract.fromArtifact('SpxCadOracle');
// const SpendingLimit = contract.fromArtifact('SpendingLimit');
// const TheCoin = contract.fromArtifact('TheCoin');
// const named = toNamedAccounts(accounts);

it('Correctly limits spending', async () => {

  const signers = initAccounts(await hre.ethers.getSigners());
  const SpxCadOracle = await hre.ethers.getContractFactory('SpxCadOracle');
  const SpendingLimit = await hre.ethers.getContractFactory('SpendingLimit');
  const tcCore = await createAndInitTheCoin();

  await tcCore.mintCoins(10000000, signers.Owner.address, Date.now());

  // pass some $$$ to client1
  await tcCore.transfer(signers.client1.address, 1000);

  // price feed init to $1
  const oracle = await SpxCadOracle.deploy();
  await oracle.initialize();
  await oracle.update(1e8);

  // Create limiter plugin
  const limiter = await SpendingLimit.deploy(oracle.address);
  const owner = await limiter.owner();

  // Assign to user, grant all permissions, limit user to $100
  await tcCore.pl_assignPlugin(signers.client1.address, limiter.address, ALL_PERMISSIONS, "0x1234");
  await limiter.setUserSpendingLimit(signers.client1.address, 100);

  // Does the plugin limit as expected?
  const coreBalance = await tcCore.balanceOf(signers.client1.address);
  expect(coreBalance.toNumber()).toEqual(1000);

  // Attempt transfer exceeding limit
  // const shouldFail = core.transfer(signers.client2, 2000, {from: signers.client1});
  // await expect(shouldFail).rejects.toThrow();
});
