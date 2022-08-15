import type { StreamID } from '@ceramicnetwork/streamid';
import type { SelfID as SrcApi } from '@self.id/web';
import { ConfigType } from './types';
import { sleep } from '@thecointech/async';
//
// An in-memory IDX mock for development/testing
export class SelfID implements Pick<SrcApi<ConfigType>, "get" | "set"> {
  async get<Key extends string | number | symbol, ContentType = any>(key: Key): Promise<ContentType | null> {
    const r = this.records.get(key);
    await sleep(500);
    return r
      ? JSON.parse(r)
      : null
  }
  async set<Key extends string | number | symbol, ContentType = any>(key: Key, content: ContentType): Promise<StreamID> {
    if (!content) this.records.delete(key);
    else this.records.set(key, JSON.stringify(content));
    await sleep(500);
    return {} as StreamID;
  }
  records: Map<string | number | symbol, string> = new Map();

  // mock client to allow Admin to use the IDX API
  client = {
    get: () => null,
  };
}

export const connectIDX = () => Promise.resolve(new SelfID)
export const setEncrypted = (idx: SelfID, definition: string, data: any | null) => idx.set(definition, data);
export const loadEncrypted = (idx: SelfID, definition: string) => idx.get(definition);

export const getLink = () => {}
export const getHistory = () => Promise.resolve([])
