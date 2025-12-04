import * as prismic from "@prismicio/client";
import * as prismicNext from "@prismicio/next";

/**
 * The Prismic repository name.
 */
export const repositoryName = "thecointech";

/**
 * A list of Route Resolver objects that define how a document's `url` field is resolved.
 *
 * {@link https://prismic.io/docs/route-resolver#route-resolver}
 */
const routes: prismic.ClientConfig["routes"] = [
    {
        type: "blog_post",
        path: "/blog/:uid",
    },
];

/**
 * Creates a Prismic client for the project's repository.
 *
 * @param config - Configuration for the Prismic client.
 */
export const createClient = (config: prismicNext.CreateClientConfig = {}) => {
    const client = prismic.createClient(repositoryName, {
        routes,
        ...config,
    });

    prismicNext.enableAutoPreviews({
        client,
        previewData: config.previewData,
        req: config.req,
    });

    return client;
};

/**
 * Re-export commonly used types and utilities for external consumption
 */
export { repositoryName as prismicRepositoryName };
export type { Content } from "@prismicio/client";
