import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import { DID } from 'dids'
import { ThreeIdConnect } from '@3id/connect';
import type { CeramicApi } from '@ceramicnetwork/common';
import { log } from '@thecointech/logging';

export async function authenticateDID(threeId: ThreeIdConnect, ceramic: CeramicApi) {
  const did = new DID({
    provider: threeId.getDidProvider(),
    resolver: ThreeIdResolver.getResolver(ceramic)
  })
  const r = await did.authenticate();
  log.trace(`Authenticated: ${r}`);
  return did;
}
