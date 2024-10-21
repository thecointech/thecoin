import { log } from '@thecointech/logging';
import { DateTime } from 'luxon';
import { getGasPrice } from './pricing';
import { GetContract } from '../../src';
import { getProvider } from '@thecointech/ethers-provider/Erc20Provider';
import { getContract } from './contract';
import type { Decimal } from 'decimal.js-light';
import { loadAndMergeHistory } from '@thecointech/tx-blockchain';
import { NormalizeAddress } from '@thecointech/utilities';

export const nullAddress = "0x0000000000000000000000000000000000000000";

export async function mintCoins(value: Decimal, to: string, date: DateTime) {
  const hasHappened = await hasAlreadyHappened(nullAddress, to, value.toNumber(), date);
  if (hasHappened)
    return hasHappened.txHash;

  const gasPrice = await getGasPrice();
  const { tcCore: mtCore } = await getContract("Minter");

  log.trace(`Begin Mint: ${value.toString()}`);
  const waiter = await mtCore.mintCoins(value.toNumber(), to, date.toMillis(), gasPrice);
  log.info(`mintCoins: ${waiter.hash}`);
  await waiter.wait(1);
  log.trace('done');
  return waiter.hash;
}

export async function burnCoins(value: Decimal, date: DateTime) {
  const hasHappened = await hasAlreadyHappened(process.env.WALLET_TheCoin_ADDRESS!, nullAddress, value.toNumber(), date);
  if (hasHappened)
    return hasHappened.txHash;

  const gasPrice = await getGasPrice();
  const { tcCore } = await getContract("TheCoin");

  log.trace(`Begin Burn: ${value.toString()}`);
  const waiter = await tcCore.burnCoins(value.toNumber(), date.toMillis(), gasPrice);
  log.info(`burnCoins: ${waiter.hash}`);
  await waiter.wait(1);
  log.trace('done');
  return waiter.hash;
}

export async function runCloneTransfer(from: string, to: string, value: number, fee: number, timestamp: DateTime) {
  const hasHappened = await hasAlreadyHappened(from, to, value, timestamp);
  if (hasHappened)
    return hasHappened.txHash;

  const gasPrice = await getGasPrice();
  const { tcCore: xaCore } = await getContract("BrokerTransferAssistant");

  log.trace(`Begin Clone: ${value.toString()}`);
  const waiter = await xaCore.runCloneTransfer(from, to, value, fee, timestamp.toMillis(), gasPrice);
  log.info(`runCloneTransfer: ${waiter.hash}`);
  await waiter.wait(1);
  log.trace('done');
  return waiter.hash;
}

async function hasAlreadyHappened(from: string, to: string, value: number, date: DateTime) {
  const contract = await GetContract();
  const history = await loadAndMergeHistory(0, contract, from);
  const fromn = NormalizeAddress(from);
  const ton = NormalizeAddress(to);
  const [similar] = history.filter(e =>
    e.date.equals(date) &&
    e.value.eq(value) &&
    e.from == fromn &&
    e.to == ton);

  if (similar) {
    log.trace(`Tx ${date.toSQLDate()} to ${to} exists, returning`);
  }
  return similar;
}

