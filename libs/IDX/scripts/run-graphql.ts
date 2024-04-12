
import { serveGraphQL } from "@composedb/devtools-node";
import { getDefintions } from '../src/definition';
import { getAdminDID } from '../internal/admin';
import { log } from '@thecointech/logging';

log.debug(`Starting GraphQL server for ${process.env.CONFIG_NAME} at http://localhost:5005/graphql`);
const definition = await getDefintions();
await serveGraphQL({
  ceramicURL: process.env.CERAMIC_URL!,
  definition,
  did: await getAdminDID(),
  port: 5005,
})
