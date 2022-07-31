import { log } from '@thecointech/logging';
import { getLink } from './link';
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { CeramicApi } from '@ceramicnetwork/common';
import type { DataModel } from '@glazed/datamodel';
import type { DIDDataStore } from '@glazed/did-datastore';
import type { ConfigType } from './types';
import type { JWE } from 'did-jwt';

type CeramicCommon = {
  ceramic: CeramicApi,
  dataModel:  DataModel<ConfigType>,
  dataStore: DIDDataStore<ConfigType>
};

// Discovered through trial-and-error
// enum CommitType {
//   INDEX,  // First commit in a stream, so probably an index
//   CAIP10_LINK, // Throws an error on load
//   TILE, // What's left
// }

export async function getHistory(address: string, { ceramic, dataModel, dataStore }: CeramicCommon) : Promise<JWE[]|null>{

  const link = await getLink(address, ceramic);
  const did = link.did; //await core.getAccountDID(link.id);
  if (!did) {
    log.debug("No DID found for account");
    return null;
  };

  log.trace(`Loading history for ${did}`);

  const definitionId = dataModel.getDefinitionID("AccountDetails");
  // The recordId is the stream defined by definition for this DID
  const streamId = await dataStore.getRecordID(definitionId!, did);
  if (!streamId)
    return null;

  const stream = await TileDocument.load(ceramic, streamId);
  const ids = stream.allCommitIds;
  // const ids = stream.state.log
  //   .map(l => new CommitID(l.type, l.cid))
  //   .filter(c => c.type === TILE_TYPE_ID);

  const allCommits = await ceramic.loadStreamCommits(streamId);
  console.log(allCommits);
  // return allCommits as any;

  log.trace(`Found ${ids.length} commits`);
  const commits = await Promise.all(ids.map(id => ceramic.loadDocument(id)));
  return commits.map(c => c.content as JWE);

  // return Promise.all(ids.map(id => TileDocument.load<JWE>(ceramic, id)));
}
