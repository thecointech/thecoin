import { Source, ExecutionResult } from 'graphql';
import { ObjMap } from 'graphql/jsutils/ObjMap';
import { ComposeClient as SrcApi } from './types';

//
// An in-memory ComposeDB mock for development/testing
export class ComposeClient implements Pick<SrcApi, "executeQuery"> {
  executeQuery<Data = Record<string, unknown>>(_source: string | Source, _variableValues?: Record<string, unknown> | undefined): Promise<ExecutionResult<Data, ObjMap<unknown>>> {
    throw new Error('Method not implemented.');
  }
  // async get<Key extends string | number | symbol, ContentType = any>(key: Key): Promise<ContentType | null> {
  //   const r = this.records.get(key);
  //   await sleep(500);
  //   return r
  //     ? JSON.parse(r)
  //     : null
  // }
  // async set<Key extends string | number | symbol, ContentType = any>(key: Key, content: ContentType): Promise<StreamID> {
  //   if (!content) this.records.delete(key);
  //   else this.records.set(key, JSON.stringify(content));
  //   await sleep(500);
  //   return {};
  // }
  records: Map<string | number | symbol, string> = new Map();
}

export const getComposeDB = () => Promise.resolve(new ComposeClient)
export const getHistory = () => Promise.resolve([])

var encrypted: any = undefined;
export const setEncrypted = (v: any) => {
  encrypted = v;
}
export const loadEncrypted = () => encrypted;
