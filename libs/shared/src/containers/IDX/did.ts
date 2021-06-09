import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import { DID } from 'dids'
import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking';
import { DidProviderProxy } from '@3id/connect';
import { get3idConnect } from './connect';
import type { CeramicApi } from '@ceramicnetwork/common';

function createDID(provider: DidProviderProxy, ceramic: CeramicApi): DID {
  return new DID({ provider, resolver: ThreeIdResolver.getResolver(ceramic) })
}

let did: DID|null = null;

export async function authenticateDID(authProvider: EthereumAuthProvider, ceramic: CeramicApi) {
  const threeIdConnect = await get3idConnect(authProvider);
  did = createDID(threeIdConnect.getDidProvider(), ceramic);
  await did.authenticate();
  ceramic.setDID(did);
  return did;
}

export const getDID = () => did!;
