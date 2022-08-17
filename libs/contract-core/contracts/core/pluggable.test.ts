import { jest } from '@jest/globals';
import { ALL_PERMISSIONS } from '../../src/constants'
import { createAndInitTheCoin, initAccounts } from '../../internal/initTest';
import type { Contract, ContractTransaction } from 'ethers';
import hre from 'hardhat';

jest.setTimeout(5 * 60 * 1000);

// Try creating core
it('Calls appropriate methods on a plugin', async () => {

  const signers = initAccounts(await hre.ethers.getSigners());
  const tcCore = await createAndInitTheCoin();
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
  const tx_assign = await tcCore.pl_assignPlugin(signers.client1.address, logger.address, ALL_PERMISSIONS, "0x1234");
  await expectEvent(tx_assign, "PluginAttached", "PrintAttached");

  // Was it assigned with the right permissions?
  const assigned = await tcCore.findPlugin(signers.client1.address, logger.address);
  expect(assigned.permissions.toString()).toEqual(ALL_PERMISSIONS);
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

  const detached = await tcCore.pl_removePlugin(signers.client1.address, 0, "0x1234");
  expectEvent(detached, "PluginDetached", "PrintDetached");

});

const maybeParseLog = (contract: Contract, l : any) => {
  try { return contract.interface.parseLog(l)} catch (e) { return null }
}
