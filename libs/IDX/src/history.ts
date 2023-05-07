import { log } from '@thecointech/logging';
import { ComposeClient } from '@composedb/client';
import { definition } from './__generated__/account-composite';
import type { JWE } from 'did-jwt';

export async function getHistory(
  client: ComposeClient,
  count?: number,
  progress?: (percent: number) => void
) {
  const ceramic = client.context.ceramic;
  const account = client.did?.parent; // 'did:pkh:eip155:31337:0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  const params = {
    account,
    model: definition.models.EncryptedProfile.id
  }
  // Get the latest record, this comes with a list of commits.
  const single = await client.context.querySingle(params);
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
