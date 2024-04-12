import { jest } from '@jest/globals';
import { ALL_PERMISSIONS, buildAssignPluginRequest, assignPlugin, buildRemovePluginRequest, removePlugin } from '@thecointech/contract-plugins';
import { createAndInitTheCoin, initAccounts } from '../../internal/testHelpers';
import type { Contract, ContractTransaction } from 'ethers';
import hre from 'hardhat';
import { DateTime } from 'luxon';

jest.setTimeout(5 * 60 * 1000);

// Potentially could be in contract-plugins, but that unfortunately
// means a circular dependency because the contract impl is here
// Could fix by moving impl there?
it ('can assign plugin', async () => {
  const signers = initAccounts(await hre.ethers.getSigners());
  const tcCore = await createAndInitTheCoin(signers.Owner);
  const DebugPrint = await hre.ethers.getContractFactory("DebugPrint");
  const logger = await DebugPrint.deploy();

  const request = await buildAssignPluginRequest(signers.client1, logger.address, ALL_PERMISSIONS);
  const tx = await assignPlugin(tcCore, request);
  expect(tx.hash).toBeDefined();
})


// Try creating core
it('Calls appropriate methods on a plugin', async () => {

  const signers = initAccounts(await hre.ethers.getSigners());
  const tcCore = await createAndInitTheCoin(signers.Owner);
  const DebugPrint = await hre.ethers.getContractFactory("DebugPrint");
  const logger = await DebugPrint.deploy();

  async function expectEvent(response: ContractTransaction, ...events: string[]) {
    const receipt = await response.wait();
    const parsedLogs = receipt.logs.map(l => (
      maybeParseLog(tcCore, l)) ??
      maybeParseLog(logger, l)
    ).map(p => p?.name);

    events.forEach(e => {
      expect(parsedLogs).toContain(e);
    });
  }

  // Assign to user, grant all permissions, limit user to $100
  const request = await buildAssignPluginRequest(signers.client1, logger.address, ALL_PERMISSIONS);
  const tx_assign = await assignPlugin(tcCore, request);
  await expectEvent(tx_assign, "PluginAttached", "PrintAttached");

  // Was it assigned with the right permissions?
  const assigned = await tcCore.findPlugin(signers.client1.address, logger.address);
  expect(assigned.permissions.toHexString()).toEqual(ALL_PERMISSIONS.toLowerCase());
  expect(assigned.plugin).toEqual(logger.address);

  // Test token balance/transfer
  const balance = 10000;
  await tcCore.mintCoins(balance, signers.Owner.address, Date.now());
  const tx_deposit = await tcCore.transfer(signers.client1.address, balance);
  expectEvent(tx_deposit, "Transfer", "PrintPreDeposit");

  const cbal = await tcCore.balanceOf(signers.client1.address);
  expect(cbal.toNumber()).toEqual(balance);
  const pbal = await tcCore.pl_balanceOf(signers.client1.address);
  expect(pbal.toNumber()).toEqual(balance / 2);

  const tx_withdraw = await tcCore.connect(signers.client1).transfer(signers.TheCoin.address, balance);
  expectEvent(tx_withdraw, "Transfer", "PrintPreWithdraw");

  const removeReq = await buildRemovePluginRequest(signers.client1, 0);
  const detached = await removePlugin(tcCore, removeReq);
  expectEvent(detached, "PluginDetached", "PrintDetached");

});

const maybeParseLog = (contract: Contract, l : any) => {
  try { return contract.interface.parseLog(l)} catch (e) { return null }
}
