import { jest } from '@jest/globals';
// import { createAndInitOracle } from '@thecointech/contract-oracle/testHelpers.ts';
// import { createAndInitTheCoin, initAccounts } from '@thecointech/contract-core/testHelpers.ts';
// import { ALL_PERMISSIONS } from '../../src/constants';
// import hre from 'hardhat';
// import '@nomiclabs/hardhat-ethers';

jest.setTimeout(5 * 60 * 1000);

// TODO: This could/should be split into it's own project

it('Correctly limits spending', async () => {

  // const signers = initAccounts(await hre.ethers.getSigners());
  // const SpendingLimit = await hre.ethers.getContractFactory('SpendingLimit');
  // const tcCore = await createAndInitTheCoin(signers.Owner);
  // const oracle = await createAndInitOracle(signers.OracleUpdater);

  // await tcCore.mintCoins(10000e6, signers.Owner.address, Date.now());

  // // pass some $$$ to client1
  // await tcCore.transfer(signers.client1.address, 1000e6);

  // // Create limiter plugin
  // const limiter = await SpendingLimit.deploy(oracle.address);

  // // Assign to user, grant all permissions, limit user to $100
  // await tcCore.pl_assignPlugin(signers.client1.address, limiter.address, ALL_PERMISSIONS, "0x1234");
  // // Set the limit to $100 (10000 cents)
  // await limiter.setUserSpendingLimit(signers.client1.address, 100e2);

  // // Test that the limit is applied
  // const now = Date.now();
  // const pw = limiter.preWithdraw(signers.client1.address, 200e6, 200e6, now);
  // await expect(pw).rejects.toThrowError("fiat limit exceeded");

  // // Does the plugin still display the full balance?
  // const tcUser = tcCore.connect(signers.client1);
  // const coreBalance = await tcUser.balanceOf(signers.client1.address);
  // expect(coreBalance.toNumber()).toEqual(1000e6);

  // // Attempt transfer exceeding limit
  // const shouldFail = tcUser.transfer(signers.client2.address, 200e6);
  // await expect(shouldFail).rejects.toThrow();
  // // Check nothing transferred
  // const c2bal = await tcUser.balanceOf(signers.client2.address);
  // expect(c2bal.toNumber()).toEqual(0);
});
