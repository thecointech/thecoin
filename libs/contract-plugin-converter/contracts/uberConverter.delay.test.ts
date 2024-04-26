import hre from 'hardhat';
import { jest } from '@jest/globals';
import { createAndInitOracle, setOracleValueRepeat } from '@thecointech/contract-oracle/testHelpers.ts';
import { ALL_PERMISSIONS, assignPlugin, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { initAccounts, createAndInitTheCoin } from '@thecointech/contract-core/testHelpers.ts';
import { buildUberTransfer } from '@thecointech/utilities/UberTransfer';
import Decimal from 'decimal.js-light';
import { DateTime, Duration } from 'luxon';
import '@nomicfoundation/hardhat-ethers';

const timeout = 10 * 60 * 1000;
jest.setTimeout(timeout);

it('Appropriately delays a transfer, and converts an appropriate amount at time', async () => {

  const signers = initAccounts(await hre.ethers.getSigners());
  const UberConverter = await hre.ethers.getContractFactory('UberConverter');
  const tcCore = await createAndInitTheCoin(signers.Owner);
  const oracle = await createAndInitOracle(signers.OracleUpdater);

  // pass some $$$ to client1
  const initAmount = 10000e6;
  await tcCore.mintCoins(initAmount, signers.Owner.address, Date.now());
  await tcCore.transfer(signers.client1.address, initAmount);

  // Create plugin
  const uber = await UberConverter.deploy();
  await uber.initialize(tcCore.address, oracle.address);

  // Assign to user, grant all permissions
  const request = await buildAssignPluginRequest(signers.client1, uber.address, ALL_PERMISSIONS);
  await assignPlugin(tcCore, request);

  // Transfer $100 in 1 weeks time.
  const delay = Duration.fromObject({day: 7});
  const transfer = await buildUberTransfer(
    signers.client1,
    signers.client2.address,
    new Decimal(100),
    124,
    DateTime.now().plus(delay),
  );

  const r = await tcCore.uberTransfer(
    transfer.chainId,
    transfer.from,
    transfer.to,
    transfer.amount,
    transfer.currency,
    transfer.transferMillis,
    transfer.signedMillis,
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
  // Note, we need the additional day as times around midnight seem to fail otherwise
  await hre.network.provider.send("evm_increaseTime", [delay.plus({day: 1}).as("seconds")]);

  // TheCoin rate is now $4
  await setOracleValueRepeat(oracle, 4, 8);
  const validTill = await oracle.validUntil();
  expect(validTill.toNumber()).toBeGreaterThan(transfer.transferMillis);
  // Assert that the pending transfer reflects the new value
  const finalBalance = await tcCore.pl_balanceOf(signers.client1.address);
  expect(initAmount - finalBalance.toNumber()).toEqual(25e6);

  // Process pending transactions
  const p = await uber.processPending(transfer.from, transfer.to, transfer.transferMillis);
  const preceipt = await p.wait();

  const final1Balance = await tcCore.pl_balanceOf(signers.client1.address);
  // If we transferred $100, that should have equalled 25C
  expect(initAmount - final1Balance.toNumber()).toEqual(25e6);
  // client2 should now have it's transfer deposited.
  const final2Balance = await tcCore.pl_balanceOf(signers.client2.address);
  expect(final2Balance.toNumber()).toEqual(25e6);

  // money was transferred, check all the info is correctt
  const allEvents = preceipt.events?.map(e => e.event ? e : tcCore.interface.parseLog(e));
  const allEventNames = allEvents?.map((e: any) => e.event ?? e.name)
  expect(allEventNames?.length).toBe(3)
  expect(allEventNames).toContain("ValueChanged");
  expect(allEventNames).toContain("Transfer");
  expect(allEventNames).toContain("ExactTransfer");

  const et = allEvents?.find((e: any) => e.name == "ExactTransfer")
  expect(et?.args?.from).toBe(transfer.from);
  expect(et?.args?.to).toBe(transfer.to);
  expect(et?.args?.timestamp.toNumber()).toBe(transfer.transferMillis);
}, timeout);
