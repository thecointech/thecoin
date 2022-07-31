import { Caip10Link } from '@ceramicnetwork/stream-caip10-link'
import { log } from '@thecointech/logging';
import type { SelfID } from './types'
import type { EthereumAuthProvider } from '@self.id/web';
import { AccountId } from 'caip';
import { CeramicApi } from '@ceramicnetwork/common';

// Create a new link to the account to allow discoverability
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

// Get the account link for the given eth address
const chainId = process.env.DEPLOY_POLYGON_NETWORK_ID ?? "1";
export async function getLink(address: string, ceramic: CeramicApi) {
  return Caip10Link.fromAccount(
    ceramic,
    new AccountId({
      address,
      chainId: {
        namespace: "eip155",
        reference: chainId,
      }
    })
  );
}

