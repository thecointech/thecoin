import type {Client} from "@prismicio/client";
import data from './data.json' with { type: "json" }

// NOTE: Not yet updated to match the latest API
class MockClient implements Pick<Client, "getByUID"> {
  getByUID(documentType: string, uid: string) {
    return Promise.resolve(
      data.results.find(r => r.uid === uid) as any
    );
  }
}

export const createClient = () => new MockClient();
