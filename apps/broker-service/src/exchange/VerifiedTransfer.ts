import { GetContract } from './Wallet';
import { TransactionResponse } from 'ethers/providers';
import { CertifiedTransferRequest } from '@thecointech/types';
import { log } from '@thecointech/logging';
import { validateTransfer } from './CertifiedActionVerify';

// Do we want to keep a record of this?
export async function certifiedTransfer(transfer: CertifiedTransferRequest) {

  const { from, to, value, fee, timestamp, signature } = transfer;
  log.trace({user: from, initialId: signature}, `Recieved transfer {initialId} for {user}`);
  await validateTransfer(transfer);

  const tc = await GetContract();
  const tx: TransactionResponse = await tc.certifiedTransfer(from, to, value, fee, timestamp, transfer.signature);
  if (!tx?.hash) {
    log.error({user: from, initialId: signature}, `Transfer {initialId} for {user} returned null `);
    throw new Error('Unknown transaction state');
  }
  return tx.hash;
}
