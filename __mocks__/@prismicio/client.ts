import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';
import type {Client} from "@prismicio/client/types/client";
import { Document } from '@prismicio/client/types/documents';
import { RequestCallback } from '@prismicio/client/types/request';
import { QueryOptions } from '@prismicio/client/types/ResolvedApi';
import data from './data.json';

class MockClient implements Pick<Client, "query"|"getByUID"> {
  query(q: string | string[], optionsOrCallback?: QueryOptions | RequestCallback<ApiSearchResponse>, cb?: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse> {
    // requires manual type override bc prismic types are wrong.
    return Promise.resolve(data as any)
  }
  getByUID(type: string, uid: string, options: QueryOptions, cb: RequestCallback<Document>): Promise<Document> {
    return Promise.resolve(
      data.results.find(r => r.uid === uid) as any
    );
  }
}

export default class {
  static client() {
    return new MockClient();
  }
}
