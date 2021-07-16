import type StreamID from '@ceramicnetwork/streamid';
import type { CreateOptions, IDX as SrcIDX } from '@ceramicstudio/idx'

//
// An in-memory IDX mock for development/testing
export class IDX implements Pick<SrcIDX, "get" | "set"> {
  records: Map<string, string> = new Map();

  get<T = unknown>(name: string, _did?: string): Promise<T | null> {
    const r = this.records.get(name);
    return Promise.resolve(
      r
        ? JSON.parse(r) as T
        : null
    );
  }

  set(name: string, content: Record<string, any>, _options?: CreateOptions): Promise<StreamID> {
    if (!content) this.records.delete(name);
    else this.records.set(name, JSON.stringify(content));
    return Promise.resolve({} as StreamID);
  }
}

export const connectIDX = () => Promise.resolve(new IDX)
export const setEncrypted = (idx: IDX, definition: string, data: any | null) => idx.set(definition, data);
export const loadEncrypted = (idx: IDX, definition: string) => idx.get(definition);
