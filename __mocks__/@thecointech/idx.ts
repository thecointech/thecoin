import type StreamID from '@ceramicnetwork/streamid';
import type { CreateOptions, IDX } from '@ceramicstudio/idx'

//
// An in-memory IDX mock for development/testing
export class MockIDX implements Pick<IDX, "get" | "set"> {
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
    if (!content) this.records.set(name, undefined);
    else this.records.set(name, JSON.stringify(content));
    return Promise.resolve({} as StreamID);
  }
}

export const connectIDX = () => Promise.resolve(new MockIDX)
export const setEncrypted = (idx: MockIDX, definition: string, data: any | null) => idx.set(definition, data);
export const loadEncrypted = (idx: MockIDX, definition: string) => idx.get(definition);
