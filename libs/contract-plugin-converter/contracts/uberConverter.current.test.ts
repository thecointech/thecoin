import hre from 'hardhat';
import { jest } from '@jest/globals';
import { describe } from '@thecointech/jestutils';
import { createAndInitOracle } from '@thecointech/contract-oracle/testHelpers.ts';
import { ALL_PERMISSIONS, assignPlugin, buildAssignPluginRequest } from '@thecointech/contract-plugins';
import { createAndInitTheCoin, getSigners } from '@thecointech/contract-core/testHelpers.ts';
import { buildUberTransfer } from '@thecointech/utilities/UberTransfer';
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import '@nomicfoundation/hardhat-ethers';
import { EventLog } from 'ethers';

const timeout = 10 * 60 * 1000;
jest.setTimeout(timeout);

// Currently duplicated into uberConverter.delay.test.ts
// while we try to figure out why it randomly crashes.
describe('Uberconverter current tests', () => {
  it('converts fiat to TheCoin for current transfers', async () => {

    const signers = await getSigners();
    const UberConverter = await hre.ethers.getContractFactory('UberConverter');
    const tcCore = await createAndInitTheCoin(signers.Owner);
    const oracle = await createAndInitOracle(signers.OracleUpdater);

    // pass some $$$ to Client1
    await tcCore.mintCoins(10000e6, signers.Owner, Date.now());
    await tcCore.transfer(signers.Client1, 1000e6);

    // Create plugin
    const uber = await UberConverter.deploy();
    await uber.initialize(tcCore, oracle);

    // Assign to user, grant all permissions
    const request = await buildAssignPluginRequest(signers.Client1, uber, ALL_PERMISSIONS);
    await assignPlugin(tcCore, request);

    // Transfer $100 now.
    const transfer = await buildUberTransfer(
      signers.Client1,
      signers.Client2,
      new Decimal(100),
      124,
      DateTime.now(),
    )
    const initBalance = await tcCore.balanceOf(signers.Client1);
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
    const Client1Balance = await tcCore.balanceOf(signers.Client1);
    // If we transferred $100, that should have equalled 50C
    expect(Number(initBalance - Client1Balance)).toEqual(50e6);
    // Client2Balance should be the remainder
    const Client2Balance = await tcCore.balanceOf(signers.Client2);
    expect(Number(Client2Balance)).toEqual(50e6);

    // The money was transferred, there should be logs!
    expect(receipt.logs?.filter((e: EventLog) => e.eventName == "Transfer").length).toEqual(1);
    expect(receipt.logs?.filter((e: EventLog) => e.eventName == "ExactTransfer").length).toEqual(1);
  });
}, !process.env.JEST_CI); // Disabled in CI until we have time to figure out why it fails there (and only there)
