import { accounts, contract } from '@openzeppelin/test-environment';
import { toNamedAccounts } from '../../test-utils/accounts';
import { join } from 'path';
import type { TheCoinInstance, DebugPrintInstance } from '../../migrations/types';
import { PLUGINMGR_ROLE, ALL_PERMISSIONS, MINTER_ROLE } from '../../src/constants'

jest.setTimeout(5 * 60 * 1000);

contract.artifactsDir = join(__dirname, "../../src/contracts");
const DebugPrint = contract.fromArtifact('DebugPrint');
const TheCoin = contract.fromArtifact('TheCoin');
const named = toNamedAccounts(accounts);

function expectEvent(response: Truffle.TransactionResponse<Truffle.AnyEvent>, ...events: string[]) {
  const allEvents = [
    ...DebugPrint.decodeLogs(response.receipt.rawLogs),
    ...TheCoin.decodeLogs(response.receipt.rawLogs),
  ].map(p => p.event);
  events.forEach(e => {
    expect(allEvents).toContain(e);
  })
}

// Try creating core
it('Calls appropriate methods on a plugin', async () => {

  const core: TheCoinInstance = await TheCoin.new();
  await core.initialize(named.TheCoin);
  await core.grantRole(PLUGINMGR_ROLE, named.TheCoin, {from: named.TheCoin});

  const logger: DebugPrintInstance = await DebugPrint.new();

  // Assign to user, grant all permissions, limit user to $100
  const tx_assign = await core.pl_assignPlugin(named.client1, logger.address, ALL_PERMISSIONS, "0x1234", { from: named.TheCoin });
  expectEvent(tx_assign, "PluginAttached", "PrintAttached");

  // Was it assigned with the right permissions?
  const assigned = await core.findPlugin(named.client1, logger.address);
  expect(assigned.permissions).toEqual(ALL_PERMISSIONS.toString());
  expect(assigned.plugin).toEqual(logger.address);

  // Test token balance/transfer
  const balance = 10000;
  await core.grantRole(MINTER_ROLE, named.Minter, { from: named.TheCoin })
  await core.mintCoins(balance, named.TheCoin, Date.now(), { from: named.Minter })
  const tx_deposit = await core.transfer(named.client1, balance, {from: named.TheCoin});
  expectEvent(tx_deposit, "Transfer", "PrintPreDeposit");

  const cbal = await core.balanceOf(named.client1);
  expect(cbal.toNumber()).toEqual(balance);
  const pbal = await core.pl_balanceOf(named.client1);
  expect(pbal.toNumber()).toEqual(balance / 2);

  const tx_withdraw = await core.transfer(named.TheCoin, balance, {from: named.client1});
  expectEvent(tx_withdraw, "Transfer", "PrintPreWithdraw");

  const detached = await core.pl_removePlugin(named.client1, 0, "0x1234", { from: named.TheCoin });
  expectEvent(detached, "PluginDetached", "PrintDetached");

});

