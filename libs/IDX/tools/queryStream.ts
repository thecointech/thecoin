import { Core } from '@self.id/core'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { getConfig } from '../src/config';

const log = console;
const aliases = await getConfig()
const core = new Core({ ceramic: process.env.CERAMIC_URL!, aliases});
const { ceramic } = core;

export async function getHistory(
  address: string,
) {

  //const link = await getLink(address, ceramic);
  const did = "did:3:kjzl6cwe1jw146vyxh3bf1l325qcb3b4rxnns181whfw1mezrpmgyia2mm2otzm" //link.did;
  if (!did) {
    log.debug("No DID found for account");
    return null;
  };

  log.trace(`Loading history for ${did}`);

  // const definitionId = dataModel.getDefinitionID("AccountDetails");
  // The recordId is the stream defined by definition for this DID
  const streamId = "k2t6wyfsu4pg1lbwntbyvrmcdigi750grb0zz44wbonrdp41fc8rlbbor37cwx"//await dataStore.getRecordID(definitionId, did);
  if (!streamId)
    return null;

  const stream = await TileDocument.load(ceramic, streamId);
  const ids = stream.allCommitIds;
  log.trace(`Found ${ids.length} commits`);

  // TODO: do this with a multi-query instead
  const commits = [] as any[];
  for (let i = 0; i < ids.length; i++) {
    try {
      const commit = await ceramic.loadStream(ids[i]);
      if (commit) {
        commits.push(commit);
      }
    }
    catch (e) {
      log.error(`Cannot load commit: ${e.message}`);
    }
  }
  return commits;
}


const all = await getHistory("0x445758e37f47b44e05e74ee4799f3469de62a2cb");
if (all) {
  for (const commit of all) {
    console.log(commit.ciphertext);
  }
}
