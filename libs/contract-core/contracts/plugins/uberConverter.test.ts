import { jest } from '@jest/globals';
import hre from 'hardhat';
import { createAndInitOracle, createAndInitTheCoin, initAccounts } from '../../internal/initTest';
import { ALL_PERMISSIONS } from '../../src/constants';
import { buildUberTransfer } from '../../src/UberTransfer';
import Decimal from 'decimal.js-light';

jest.setTimeout(5 * 60 * 1000);

it('Correctly adjusts TheCoin', async () => {

  const signers = initAccounts(await hre.ethers.getSigners());
  const UberConverter = await hre.ethers.getContractFactory('UberConverter');
  const tcCore = await createAndInitTheCoin();
  const oracle = await createAndInitOracle(signers.OracleUpdater);

  // pass some $$$ to client1
  await tcCore.mintCoins(10000e6, signers.Owner.address, Date.now());
  await tcCore.transfer(signers.client1.address, 1000e6);

  // Create plugin
  const uber = await UberConverter.deploy(tcCore.address, oracle.address);

  // Assign to user, grant all permissions
  await tcCore.pl_assignPlugin(signers.client1.address, uber.address, ALL_PERMISSIONS, "0x1234");

  // Transfer $100 now.
  const transfer = await buildUberTransfer(
    signers.client1,
    signers.client2.address,
    new Decimal(100),
    124,
    Date.now(),
    Date.now(),
  )
  const initBalance = await tcCore.balanceOf(signers.client1.address);
  const r = await tcCore.uberTransfer(
    transfer.from,
    transfer.to,
    transfer.amount,
    transfer.currency,
    transfer.transferTime,
    transfer.transferTime,
    transfer.signature,
  );
  await r.wait();
  const finalBalance = await tcCore.balanceOf(signers.client1.address);
  // If we transferred $100, that should have equalled $200
  expect(initBalance.toNumber() - finalBalance.toNumber()).toEqual(50e6);
  // Test that the limit is applied
  // const now = Math.round(Date.now() / 1000);
  // const pw = limiter.preWithdraw(signers.client1.address, 200e6, now);
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
