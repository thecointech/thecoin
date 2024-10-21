import { jest } from '@jest/globals';
import { ALL_PERMISSIONS, buildAssignPluginRequest, assignPlugin, buildRemovePluginRequest, removePlugin } from '@thecointech/contract-plugins';
import { createAndInitTheCoin, initAccounts } from '../../internal/testHelpers';
import type { BaseContract, ContractTransactionResponse } from 'ethers';
import hre from 'hardhat';

jest.setTimeout(5 * 60 * 1000);

// Potentially could be in contract-plugins, but that unfortunately
// means a circular dependency because the contract impl is here
// Could fix by moving impl there?
it ('can assign plugin', async () => {
  const signers = initAccounts(await hre.ethers.getSigners());
  const tcCore = await createAndInitTheCoin(signers.Owner);
  const DebugPrint = await hre.ethers.getContractFactory("DebugPrint");
  const logger = await DebugPrint.deploy();
  const loggerAddress = await logger.getAddress();
  const request = await buildAssignPluginRequest(signers.client1, loggerAddress, ALL_PERMISSIONS);
  const tx = await assignPlugin(tcCore, request);
  expect(tx.hash).toBeDefined();
})


// Try creating core
it('Calls appropriate methods on a plugin', async () => {

  const signers = initAccounts(await hre.ethers.getSigners());
  const tcCore = await createAndInitTheCoin(signers.Owner);
  const DebugPrint = await hre.ethers.getContractFactory("DebugPrint");
  const logger = await DebugPrint.deploy();
  const loggerAddress = await logger.getAddress();

  async function expectEvent(response: ContractTransactionResponse, ...events: string[]) {
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
  const request = await buildAssignPluginRequest(signers.client1, loggerAddress, ALL_PERMISSIONS);
  const tx_assign = await assignPlugin(tcCore, request);
  await expectEvent(tx_assign, "PluginAttached", "PrintAttached");

  // Was it assigned with the right permissions?
  const assigned = await tcCore.findPlugin(signers.client1.address, loggerAddress);
  expect(assigned.permissions).toEqual(ALL_PERMISSIONS);
  expect(assigned.plugin).toEqual(loggerAddress);

  // Test token balance/transfer
  const balance = 10000n;
  await tcCore.mintCoins(balance, signers.Owner.address, Date.now());
  const tx_deposit = await tcCore.transfer(signers.client1.address, balance);
  expectEvent(tx_deposit, "Transfer", "PrintPreDeposit");

  const cbal = await tcCore.balanceOf(signers.client1.address);
  expect(cbal).toEqual(balance);
  const pbal = await tcCore.pl_balanceOf(signers.client1.address);
  expect(pbal).toEqual(balance / 2n);

  const tx_withdraw = await tcCore.connect(signers.client1).transfer(signers.TheCoin.address, balance);
  expectEvent(tx_withdraw, "Transfer", "PrintPreWithdraw");

  const removeReq = await buildRemovePluginRequest(signers.client1, 0);
  const detached = await removePlugin(tcCore, removeReq);
  expectEvent(detached, "PluginDetached", "PrintDetached");

});

const maybeParseLog = (contract: BaseContract, l : any) => {
  try { return contract.interface.parseLog(l)} catch (e) { return null }
}
