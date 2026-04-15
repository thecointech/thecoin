import type {Client} from "@prismicio/client";
import faqs from './mock.faqs.json' with { type: "json" }
import articles from './mock.articles.json' with { type: "json" }

// Re-export everything from the actual module by importing it directly
// This works because we're in a __mocks__ directory, so we need to explicitly
// reach into node_modules to get the real package
export * from "../../../node_modules/@prismicio/client/dist/index.js";

// NOTE: Not yet updated to match the latest API
type SharedType = typeof articles[number]|typeof faqs[number];
class MockClient implements Pick<Client, "getByUID"|"getByID"|"getAllByType"> {
  getByUID(documentType: string, uid: string, options?: {lang?: string}) {
    return Promise.resolve(
      getData(documentType, options?.lang).find(r => r.uid === uid) as any
    );
  }
  getAllByType(documentType: string, options?: {lang?: string}) {
    return Promise.resolve(
      getData(documentType, options?.lang) as any
    );
  }
  // Used for previews, might fail in dev
  getByID(documentId: string, options?: {lang?: string}): Promise<any> {
    return Promise.reject(new Error("Previewing not supported in mock: " + process.env.CONFIG_NAME));
  }
}

const filterData = (data: SharedType[], lang = "en-ca") =>
  lang == '*'
    ? data
    : data.filter(r => r.lang === lang);

const getData = (documentType: string, lang = "en-ca") => {
  switch (documentType) {
    case "article":
      return filterData(articles as SharedType[], lang);
    case "faq":
      return filterData(faqs as SharedType[], lang);
    default:
      throw new Error(`Unsupported Prismic document type in mock: ${documentType}`);
  }
}

export function createClient() {
  return new MockClient() as unknown as Client;
}
