import type StreamID from '@ceramicnetwork/streamid';
import type { SelfID as SrcApi } from '@self.id/web';

//
// An in-memory IDX mock for development/testing
export class SelfID implements Pick<SrcApi, "get" | "set"> {
  get<Key extends string | number | symbol, ContentType = any>(key: Key): Promise<ContentType | null> {
    const r = this.records.get(key);
    return Promise.resolve(
      r
        ? JSON.parse(r)
        : null
    );
  }
  set<Key extends string | number | symbol, ContentType = any>(key: Key, content: ContentType): Promise<StreamID> {
    if (!content) this.records.delete(key);
    else this.records.set(key, JSON.stringify(content));
    return Promise.resolve({} as StreamID);
  }
  records: Map<string | number | symbol, string> = new Map();
}

export const connectIDX = () => Promise.resolve(new SelfID)
export const setEncrypted = (idx: SelfID, definition: string, data: any | null) => idx.set(definition, data);
export const loadEncrypted = (idx: SelfID, definition: string) => idx.get(definition);
