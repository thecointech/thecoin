import hre from 'hardhat';
import { jest } from '@jest/globals';
import { createAndInitOracle } from '@thecointech/contract-oracle/testHelpers.ts';
import { ALL_PERMISSIONS, assignPlugin, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { initAccounts, createAndInitTheCoin } from '@thecointech/contract-core/testHelpers.ts';
import { buildUberTransfer } from '@thecointech/utilities/UberTransfer';
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import '@nomicfoundation/hardhat-ethers';
import { EventLog } from 'ethers';

const timeout = 10 * 60 * 1000;
jest.setTimeout(timeout);

it('converts fiat to TheCoin for current transfers', async () => {

  const signers = initAccounts(await hre.ethers.getSigners());
  const UberConverter = await hre.ethers.getContractFactory('UberConverter');
  const tcCore = await createAndInitTheCoin(signers.Owner);
  const oracle = await createAndInitOracle(signers.OracleUpdater);

  // pass some $$$ to client1
  await tcCore.mintCoins(10000e6, signers.Owner, Date.now());
  await tcCore.transfer(signers.client1, 1000e6);

  // Create plugin
  const uber = await UberConverter.deploy();
  await uber.initialize(tcCore, oracle);

  // Assign to user, grant all permissions
  const request = await buildAssignPluginRequest(signers.client1, uber, ALL_PERMISSIONS);
  await assignPlugin(tcCore, request);

  // Transfer $100 now.
  const transfer = await buildUberTransfer(
    signers.client1,
    signers.client2,
    new Decimal(100),
    124,
    DateTime.now(),
  )
  const initBalance = await tcCore.balanceOf(signers.client1);
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
  const client1Balance = await tcCore.balanceOf(signers.client1);
  // If we transferred $100, that should have equalled 50C
  expect(Number(initBalance - client1Balance)).toEqual(50e6);
  // client2Balance should be the remainder
  const client2Balance = await tcCore.balanceOf(signers.client2);
  expect(Number(client2Balance)).toEqual(50e6);

  // The money was transferred, there should be logs!
  expect(receipt.logs?.filter((e: EventLog) => e.eventName == "Transfer").length).toEqual(1);
  expect(receipt.logs?.filter((e: EventLog) => e.eventName == "ExactTransfer").length).toEqual(1);
}, timeout);
