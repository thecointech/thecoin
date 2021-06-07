import './setenv';
import { join } from 'path';
import { promises } from "fs";
import Ceramic from '@ceramicnetwork/http-client';
import { createDefinition, publishSchema } from '@ceramicstudio/idx-tools';
import { Ed25519Provider } from 'key-did-provider-ed25519';
import { fromString } from 'uint8arrays';
import KeyDidResolver from 'key-did-resolver';
import { Resolver } from 'did-resolver';
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import { DID } from 'dids';

const idxFolder = join(__dirname, '..', 'libs', 'shared', 'src', 'containers', 'IDX');
const schemaPath = `${idxFolder}/config.${process.env.CONFIG_NAME}.json`;
const { writeFile, readFile } = promises;

//
// Publish our schema to the node (must happen once per deploy)
async function publish(ceramic: Ceramic) {
  // Publish the two schemas
  const schema = await readFile(`${idxFolder}/schemaJWE.json`, 'utf8');
  const SchemaJWE = JSON.parse(schema);
  return publishSchema(ceramic, {
    name: "UserData",
    content: SchemaJWE
  })
}

//
// Connect to the Ceramic node
async function connect() {
  const ceramic = new Ceramic(process.env.CERAMIC_API)
  // Provide the DID Resolver and Provider to Ceramic
  const resolver = new Resolver({
    ...KeyDidResolver.getResolver(),
    ...ThreeIdResolver.getResolver(ceramic)
  })

  // The seed must be provided as an environment variable
  console.log(`Config: ${process.env.CONFIG_NAME}`);
  console.log(`Seed: ${process.env.CERAMIC_SEED}`);
  const seed = fromString(process.env.CERAMIC_SEED, 'base16')
  const provider = new Ed25519Provider(seed)
  const did = new DID({ provider, resolver })
  await ceramic.setDID(did)
  // Authenticate the Ceramic instance with the provider
  await ceramic.did.authenticate();
  return ceramic;
}

async function run() {

  // Connect to local node
  const ceramic = await connect();
  // Publish schema to node
  const schemaJwe = await publish(ceramic);

  // Create the definition using the created schema ID
  const privateDetails = await createDefinition(ceramic, {
    name: 'privateDetails',
    description: 'Verified account details',
    schema: schemaJwe.commitId.toUrl(),
  })

  // Write config to JSON file
  const config = {
    definitions: {
      privateDetails: privateDetails.id.toString(),
    },
    schemas: {
      jwe: schemaJwe.commitId.toUrl(),
    },
  }
  await writeFile(schemaPath, JSON.stringify(config, null, 2));

  console.log(`Config written to ${schemaPath}`, config)
  process.exit(0)
}

run().catch(console.error)
