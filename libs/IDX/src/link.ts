import { Caip10Link } from '@ceramicnetwork/stream-caip10-link'
import { log } from '@thecointech/logging';
import type { SelfID } from './types'
import type { EthereumAuthProvider } from '@self.id/web';

export async function createLink(idx: SelfID, authProvider: EthereumAuthProvider) {
  // Retrieve the CAIP-10 account from the EthereumAuthProvider instance
  const accountId = await authProvider.accountId();

  // Load the account link based on the account ID
  const accountLink = await Caip10Link.fromAccount(
    idx.client.ceramic,
    accountId,
  )

  if (accountLink.did !== idx.did.id) {
    // Finally, link the DID to the account using the EthereumAuthProvider instance
    await accountLink.setDid(
      idx.did.id,
      authProvider,
    )
    log.info("IDX: Linked account to DID");
  }
}
