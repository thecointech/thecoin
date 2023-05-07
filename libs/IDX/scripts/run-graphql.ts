
import { serveGraphQL } from "@composedb/devtools-node";
import { definition } from '../src/__generated__/account-composite';
import { getAdminDID } from '../internal/admin';

await serveGraphQL({
  ceramicURL: process.env.CERAMIC_URL!,
  definition,
  did: await getAdminDID(),
  port: 5005,
})
