import { jest } from '@jest/globals';
import hre from 'hardhat';
import { createAndInitOracle, createAndInitTheCoin, initAccounts, setOracleValueRepeat } from '../../internal/initTest';
import { ALL_PERMISSIONS } from '../../src/constants';
import { buildUberTransfer } from '../../src/UberTransfer';
import Decimal from 'decimal.js-light';
import { DateTime, Duration } from 'luxon';

jest.setTimeout(5 * 60 * 1000);

// it('converts fiat to TheCoin for current transfers', async () => {

//   const signers = initAccounts(await hre.ethers.getSigners());
//   const UberConverter = await hre.ethers.getContractFactory('UberConverter');
//   const tcCore = await createAndInitTheCoin();
//   const oracle = await createAndInitOracle(signers.OracleUpdater);

//   // pass some $$$ to client1
//   await tcCore.mintCoins(10000e6, signers.Owner.address, Date.now());
//   await tcCore.transfer(signers.client1.address, 1000e6);

//   // Create plugin
//   const uber = await UberConverter.deploy(tcCore.address, oracle.address);

//   // Assign to user, grant all permissions
//   await tcCore.pl_assignPlugin(signers.client1.address, uber.address, ALL_PERMISSIONS, "0x1234");

//   // Transfer $100 now.
//   const transfer = await buildUberTransfer(
//     signers.client1,
//     signers.client2.address,
//     new Decimal(100),
//     124,
//     Date.now(),
//     Date.now(),
//   )
//   const initBalance = await tcCore.balanceOf(signers.client1.address);
//   const r = await tcCore.uberTransfer(
//     transfer.from,
//     transfer.to,
//     transfer.amount,
//     transfer.currency,
//     transfer.transferTime,
//     transfer.signedTime,
//     transfer.signature,
//   );
//   const receipt = await r.wait();
//   const client1Balance = await tcCore.balanceOf(signers.client1.address);
//   // If we transferred $100, that should have equalled 50C
//   expect(initAmount - client1Balance.toNumber()).toEqual(50e6);
//   // client2Balance should be the remainder
//   const client2Balance = await tcCore.balanceOf(signers.client2.address);
//   expect(client2Balance.toNumber()).toEqual(50e6);

//   // The money was transferred, there should be logs!
//   expect(receipt.events?.filter(e => e.event == "Transfer").length).toEqual(1);
//   expect(receipt.events?.filter(e => e.event == "ExactTransfer").length).toEqual(1);
// });


it('Appropriately delays a transfer, and converts an appropriate amount at time', async () => {

  const signers = initAccounts(await hre.ethers.getSigners());
  const UberConverter = await hre.ethers.getContractFactory('UberConverter');
  const tcCore = await createAndInitTheCoin();
  const oracle = await createAndInitOracle(signers.OracleUpdater);

  // pass some $$$ to client1
  const initAmount = 10000e6;
  await tcCore.mintCoins(initAmount, signers.Owner.address, Date.now());
  await tcCore.transfer(signers.client1.address, initAmount);

  // Create plugin
  const uber = await UberConverter.deploy(tcCore.address, oracle.address);

  // Assign to user, grant all permissions
  await tcCore.pl_assignPlugin(signers.client1.address, uber.address, ALL_PERMISSIONS, "0x1234");

  // Transfer $100 in 1 weeks time.
  const delay = Duration.fromObject({day: 7});
  const transfer = await buildUberTransfer(
    signers.client1,
    signers.client2.address,
    new Decimal(100),
    124,
    DateTime.now().plus(delay),
    DateTime.now(),
  );

  const r = await tcCore.uberTransfer(
    transfer.from,
    transfer.to,
    transfer.amount,
    transfer.currency,
    transfer.transferTime,
    transfer.signedTime,
    transfer.signature,
  );
  const receipt = await r.wait();
  const interim1Balance = await tcCore.pl_balanceOf(signers.client1.address);
  // If we transferred $100, that should have equalled 50C
  expect(initAmount - interim1Balance.toNumber()).toEqual(50e6);
  // but client2 has not actually received anything yet, so it's balance is 0
  const interim2Balance = await tcCore.pl_balanceOf(signers.client2.address);
  expect(interim2Balance.toNumber()).toEqual(0);
  // No money was transferred, so no events!
  expect(receipt.events?.filter(e => e.event == "Transfer").length).toEqual(0);
  // TODO: Log event for reserving $$$

  // Ensure that client1 cannot transfer out dosh
  const rawBalance = await tcCore.balanceOf(signers.client1.address);
  expect(rawBalance.toNumber()).toEqual(initAmount);
  const tcClient1 = tcCore.connect(signers.client1);
  // Ensure we can't transfer more than is promised
  await expect(
    tcClient1.transfer(signers.BrokerCAD.address, initAmount)
  ) .rejects
    .toThrow()

  // Now advance time so that that client2 can claim the transfer
  await hre.network.provider.send("evm_increaseTime", [delay.as("seconds")]);
  // TheCoin rate is now $4
  await setOracleValueRepeat(oracle, 4, 7);
  const validTill = await oracle.validUntil();
  expect(validTill.toNumber()).toBeGreaterThan(transfer.transferTime);
  // Assert that the pending transfer reflects the new value
  const finalBalance = await tcCore.pl_balanceOf(signers.client1.address);
  expect(initAmount - finalBalance.toNumber()).toEqual(25e6);

  // Process pending transactions
  const p = await uber.processPending(transfer.from, transfer.to, transfer.transferTime);
  const preceipt = await p.wait();

  const final1Balance = await tcCore.pl_balanceOf(signers.client1.address);
  // If we transferred $100, that should have equalled 25C
  expect(initAmount - final1Balance.toNumber()).toEqual(25e6);
  // client2 should now have it's transfer deposited.
  const final2Balance = await tcCore.pl_balanceOf(signers.client2.address);
  expect(final2Balance.toNumber()).toEqual(25e6);
  // money was transferred
  // TODO: This is a transfer event, but not named because we got it fron the wrong contract
  // Check using tcCore events thingy
  expect(preceipt.events?.length).toEqual(1);
});
