import { TransactionResponse } from '@ethersproject/providers';
import { log } from '@thecointech/logging';
import type { UberTransfer } from '@thecointech/types';
import { GetContract } from './Wallet';
import { getBrokerCADAddress } from '../status';

// Do we want to keep a record of this?
export async function uberTransfer(transfer: UberTransfer) {
  const {
    from, to, amount, currency, transferMillis, signedMillis, signature,
  } = transfer;
  log.trace({ user: from, initialId: signature }, 'Recieved UberTransfer {initialId} for {user}');

  // Minimal validation for now:
  const brokerCAD = await getBrokerCADAddress();
  if (transfer.to != brokerCAD)
    throw new Error(`Invalid destination address: ${transfer.to}`);

  const tc = await GetContract();
  const tx: TransactionResponse = await tc.uberTransfer(
    from, to, amount, currency, transferMillis, signedMillis, signature,
  );
  if (!tx?.hash) {
    log.error({ user: from, initialId: signature }, 'UberTransfer {initialId} for {user} returned null ');
    throw new Error('Unknown transaction state');
  }
  return tx.hash;
}
