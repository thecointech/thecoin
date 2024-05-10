import { log } from '@thecointech/logging';
import { ComposeClient } from '@composedb/client';
import { getDefintions } from './definition';
import type { JWE } from 'did-jwt';

export async function getHistory(
  address: string,
  client: ComposeClient,
  count?: number,
  progress?: (percent: number) => void
) {
  const definition = await getDefintions();
  const ceramic = client.context.ceramic;
  //const account = client.did?.parent; // 'did:pkh:eip155:31337:0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  const account = `did:pkh:eip155:${process.env.DEPLOY_POLYGON_NETWORK_ID}:${address.toLowerCase()}`;
  const params = {
    account,
    model: definition.models.EncryptedProfile.id
  }
  debugger;
  // Get the latest record, this comes with a list of commits.
  const single = await (client.context as any).querySingle(params);
  if (single) {
    // Load prior commits
    const ids = single.allCommitIds;
    const commits: JWE[] = [];
    const numToFetch = count ?? ids.length;
    const startAt = ids.length - numToFetch;
    for (let i = startAt; i < ids.length; i++) {
      try {
        const commit = await ceramic.loadStream(ids[i]);
        if (commit) {
          commits.push(commit.content);
        }
      }
      catch (e: any) {
        log.error(`Cannot load commit: ${e.message}`);
      }
      progress?.((i - startAt) / numToFetch);
      console.log(i - startAt);
    }
    return commits;
  }
  return null;
}
