import hre from 'hardhat';
import { jest } from '@jest/globals';
import { createAndInitOracle, setOracleValueRepeat } from '@thecointech/contract-oracle/testHelpers.ts';
import { ALL_PERMISSIONS, assignPlugin, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { initAccounts, createAndInitTheCoin } from '@thecointech/contract-core/testHelpers.ts';
import { buildUberTransfer } from '@thecointech/utilities/UberTransfer';
import Decimal from 'decimal.js-light';
import { DateTime, Duration } from 'luxon';
import '@nomicfoundation/hardhat-ethers';
import { EventLog } from 'ethers';

const timeout = 10 * 60 * 1000;
jest.setTimeout(timeout);

it('Appropriately delays a transfer, and converts an appropriate amount at time', async () => {

  const signers = initAccounts(await hre.ethers.getSigners());
  const UberConverter = await hre.ethers.getContractFactory('UberConverter');
  const tcCore = await createAndInitTheCoin(signers.Owner);
  const oracle = await createAndInitOracle(signers.OracleUpdater);

  // pass some $$$ to client1
  const initAmount = 10000e6;
  await tcCore.mintCoins(initAmount, signers.Owner, Date.now());
  await tcCore.transfer(signers.client1, initAmount);

  // Create plugin
  const uber = await UberConverter.deploy();
  await uber.initialize(tcCore, oracle);

  // Assign to user, grant all permissions
  const request = await buildAssignPluginRequest(signers.client1, uber, ALL_PERMISSIONS);
  await assignPlugin(tcCore, request);

  // Transfer $100 in 1 weeks time.
  const delay = Duration.fromObject({day: 7});
  const transfer = await buildUberTransfer(
    signers.client1,
    signers.client2,
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
  const interim1Balance = await tcCore.pl_balanceOf(signers.client1);
  // If we transferred $100, that should have equalled 50C
  expect(initAmount - Number(interim1Balance)).toEqual(50e6);
  // but client2 has not actually received anything yet, so it's balance is 0
  const interim2Balance = await tcCore.pl_balanceOf(signers.client2);
  expect(Number(interim2Balance)).toEqual(0);
  // No money was transferred, so no events!
  expect(receipt.logs?.filter((e: EventLog) => e.eventName == "Transfer").length).toEqual(0);
  // TODO: Log event for reserving $$$

  // Ensure that client1 cannot transfer out dosh
  const rawBalance = await tcCore.balanceOf(signers.client1);
  expect(Number(rawBalance)).toEqual(initAmount);
  const tcClient1 = tcCore.connect(signers.client1);
  // Ensure we can't transfer more than is promised
  await expect(
    tcClient1.transfer(signers.BrokerCAD, initAmount)
  ) .rejects
    .toThrow()

  // Now advance time so that that client2 can claim the transfer
  // Note, we need the additional day as times around midnight seem to fail otherwise
  await hre.network.provider.send("evm_increaseTime", [delay.plus({day: 1}).as("seconds")]);

  // TheCoin rate is now $4
  await setOracleValueRepeat(oracle, 4, 8);
  const validTill = await oracle.validUntil();
  expect(Number(validTill)).toBeGreaterThan(transfer.transferMillis);
  // Assert that the pending transfer reflects the new value
  const finalBalance = await tcCore.pl_balanceOf(signers.client1);
  expect(initAmount - Number(finalBalance)).toEqual(25e6);

  // Process pending transactions
  const p = await uber.processPending(transfer.from, transfer.to, transfer.transferMillis);
  const preceipt = await p.wait();

  const final1Balance = await tcCore.pl_balanceOf(signers.client1);
  // If we transferred $100, that should have equalled 25C
  expect(initAmount - Number(final1Balance)).toEqual(25e6);
  // client2 should now have it's transfer deposited.
  const final2Balance = await tcCore.pl_balanceOf(signers.client2);
  expect(Number(final2Balance)).toEqual(25e6);

  // money was transferred, check all the info is correct
  const allEvents =  preceipt.logs?.map(e => (e as EventLog).eventName ? e : tcCore.interface.parseLog(e)) as any[];
  const allEventNames = allEvents?.map(e => e.eventName ?? e.name);
  expect(allEventNames?.length).toBe(3)
  expect(allEventNames).toContain("ValueChanged");
  expect(allEventNames).toContain("Transfer");
  expect(allEventNames).toContain("ExactTransfer");

  const et = allEvents?.find(e => e.name == "ExactTransfer")
  expect(et?.args?.from).toEqual(transfer.from);
  expect(et?.args?.to).toEqual(transfer.to);
  expect(Number(et?.args?.timestamp)).toEqual(transfer.transferMillis);
}, timeout);
