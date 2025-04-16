import type {BuildQueryURLArgs, Client} from "@prismicio/client";
import data from './data.json' with { type: "json" }
import { PrismicDocument, Query } from '@prismicio/types';

class MockClient implements Pick<Client<PrismicDocument>, "query"|"getByUID"> {
  query<TDocument extends PrismicDocument<Record<string, any>, string, string>>(predicates: string | string[], params?: (Partial<Omit<BuildQueryURLArgs, 'predicates'>> & { signal?: { aborted: any; addEventListener: any; removeEventListener: any; dispatchEvent: any; onabort: any; } | undefined; }) | undefined): Promise<Query<TDocument>> {
    return Promise.resolve(data as any)
  }
  getByUID<TDocument extends PrismicDocument<Record<string, any>, string, string>, TDocumentType extends TDocument['type'] = TDocument['type']>(documentType: TDocumentType, uid: string, params?: (Partial<BuildQueryURLArgs> & { signal?: { aborted: any; addEventListener: any; removeEventListener: any; dispatchEvent: any; onabort: any; } | undefined; }) | undefined): Promise<Extract<TDocument, { type: TDocumentType; }> extends never ? TDocument : Extract<TDocument, { type: TDocumentType; }>> {
    return Promise.resolve(
      data.results.find(r => r.uid === uid) as any
    );
  }
}

export const createClient = () => new MockClient();
