import '@thecointech/setenv';
import { join } from 'path';
import { promises } from "fs";
import { CeramicClient } from '@ceramicnetwork/http-client'
import { ModelManager } from '@glazed/devtools'
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { fromString } from 'uint8arrays';
import { getResolver } from 'key-did-resolver'
import { DID } from 'dids';

const idxFolder = join(__dirname, '..', 'libs', 'IDX', 'src');
const schemaPath = `${idxFolder}/config.${process.env.CONFIG_NAME}.json`;
const { writeFile, readFile } = promises;

//
// Publish our schema to the node (must happen once per deploy)
async function publish(manager: ModelManager) {
  // Publish the two schemas
  const schema = await readFile(`${idxFolder}/schemaJWE.json`, 'utf8');
  const SchemaJWE = JSON.parse(schema);
  const schemaId =  await manager.createSchema("jwe", SchemaJWE);

  const privateDetails = await manager.createDefinition("AccountDetails", {
    name: 'AccountDetails',
    description: 'Verified account details',
    schema: manager.getSchemaURL(schemaId),
  })
  return privateDetails;
}

//
// Connect to the Ceramic node
async function connect() {
  // Create and authenticate the DID
  const seed = fromString(process.env.CERAMIC_SEED, 'base16')
  const did = new DID({
    provider: new Ed25519Provider(seed),
    resolver: getResolver(),
  })
  // Authenticate the Ceramic instance with the provider
  await did.authenticate()

  // The seed must be provided as an environment variable
  const ceramic = new CeramicClient(process.env.CERAMIC_URL)
  await ceramic.setDID(did)
  return ceramic;
}

async function run() {

  // Connect to local node
  const ceramic = await connect();
  // Create a manager for the model
  const manager = new ModelManager(ceramic)

  // prepare schema for publishing
  await publish(manager);

  // Publish and store details
  const model = await manager.toPublished()

  // Write details to path
  const config = JSON.stringify(model, null, 2)
  await writeFile(schemaPath, config);

  console.log(`Config written to ${schemaPath}`, config)
  process.exit(0)
}

run().catch(console.error)
