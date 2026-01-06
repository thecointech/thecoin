import { GetContract } from '../signer/Wallet';
import { CertifiedTransferRequest } from '@thecointech/types';
import { log } from '@thecointech/logging';
import { validateTransfer } from './CertifiedActionVerify';

// Do we want to keep a record of this?
export async function certifiedTransfer(transfer: CertifiedTransferRequest) {

  const { chainId, from, to, value, fee, timestamp, signature } = transfer;
  log.trace({user: from, initialId: signature}, `Recieved transfer {initialId} for {user}`);
  await validateTransfer(transfer);

  const tc = await GetContract();
  const tx = await tc.certifiedTransfer(chainId, from, to, value, fee, timestamp, transfer.signature);
  if (!tx.hash) {
    log.error({user: from, initialId: signature}, `Transfer {initialId} for {user} returned null `);
    throw new Error('Unknown transaction state');
  }
  return tx.hash;
}
