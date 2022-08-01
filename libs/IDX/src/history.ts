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

export async function getHistory(address: string, { ceramic, dataModel, dataStore }: CeramicCommon) : Promise<JWE[]|null>{

  const link = await getLink(address, ceramic);
  const did = link.did;
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

  log.trace(`Found ${ids.length} commits`);
  // TODO: do this with a multi-query instead
  const commits = await Promise.all(ids.map(id => ceramic.loadStream(id)));
  return commits.map(c => c.content as JWE);
}
