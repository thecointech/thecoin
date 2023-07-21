import { CeramicClient } from '@ceramicnetwork/http-client'
import { log } from "@thecointech/logging";
import { createComposite, readEncodedComposite, writeEncodedComposite, writeEncodedCompositeRuntime } from '@composedb/devtools-node'
import { fileURLToPath } from 'url'
import { Composite } from '@composedb/devtools'
import { getAdminDID } from '../internal/admin'

const schemaFolder = new URL('../schema/', import.meta.url);
const outJson = new URL('./output/', schemaFolder);

const files = [
  './profile.graphql',
  // './testing.graphql',
  // './message.graphql',
  // './profile-simple.graphql',
]

const outputPath = fileURLToPath(new URL('./merged.json', outJson))
const compiledJson = fileURLToPath(new URL(`./${process.env.CONFIG_NAME}-compiled.json`, outJson))
const compiledTs = fileURLToPath(new URL(`../src/__generated__/${process.env.CONFIG_NAME}-definition.ts`, import.meta.url))

async function getCeramic() {
  log.debug("Connecting to Ceramic...");

  const ceramicUrl = process.env.CERAMIC_URL
  if (!ceramicUrl) {
    throw new Error("Missing CERAMIC_URL")
  }
  const did = await getAdminDID();

  // Replace by the URL of the Ceramic node you want to deploy the Models to
  const ceramic = new CeramicClient(ceramicUrl)
  // An authenticated DID with admin access must be set on the Ceramic instance
  ceramic.did = did
  return ceramic;
}

async function convertSchemaToComposite(ceramic: CeramicClient) {
  log.debug("Merging Schema to Composite");
  const srcs = await Promise.all(files.map(
      file => createComposite(ceramic, fileURLToPath(new URL(file, schemaFolder)))
  ));
  const mergedComposite = Composite
    .from(srcs)

  // Replace by the path to the encoded composite file
  await writeEncodedComposite(mergedComposite, outputPath);
}

async function deployComposite(ceramic: CeramicClient) {
  log.debug("Deploying Merged");
  const composite = await readEncodedComposite(ceramic, outputPath)
  // Notify the Ceramic node to index the models present in the composite
  await composite.startIndexingOn(ceramic)
}

async function compileForClient() {
  log.debug("Compiling for Client");
  await writeEncodedCompositeRuntime(ceramic, outputPath, compiledTs);
  await writeEncodedCompositeRuntime(ceramic, outputPath, compiledJson);
}

const ceramic = await getCeramic();
await convertSchemaToComposite(ceramic);
await deployComposite(ceramic);
await compileForClient();
