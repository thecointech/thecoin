import type {Client} from "@prismicio/client";
import faqs from './mock.faqs.json' with { type: "json" }
import articles from './mock.articles.json' with { type: "json" }

// Re-export everything from the actual module by importing it directly
// This works because we're in a __mocks__ directory, so we need to explicitly
// reach into node_modules to get the real package
export * from "../../../node_modules/@prismicio/client/dist/index.js";

// NOTE: Not yet updated to match the latest API
type SharedType = typeof articles[number]|typeof faqs[number];
class MockClient implements Pick<Client, "getByUID"|"getAllByType"> {
  getByUID(documentType: string, uid: string) {
    return Promise.resolve(
      getData(documentType).find(r => r.uid === uid) as any
    );
  }
  getAllByType(documentType: string) {
    return Promise.resolve(
      getData(documentType).filter(r => r.type === documentType) as any
    );
  }
}
const getData = (documentType: string) => {
  switch (documentType) {
    case "article":
      return articles as SharedType[];
    case "faq":
      return faqs as SharedType[];
    default:
      return [];
  }
}

export function createClient() {
  return new MockClient() as unknown as Client;
}
