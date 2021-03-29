const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'environments', 'debug.env')});

const { writeFile, readFile } = require('fs').promises
const Ceramic = require('@ceramicnetwork/http-client').default
const { createDefinition, publishSchema } = require('@ceramicstudio/idx-tools')
const { Ed25519Provider } = require('key-did-provider-ed25519')
const fromString = require('uint8arrays/from-string');

const IdxFolder = path.join(__dirname, '..', 'libs', 'shared', 'src', 'containers', 'IDX');
const CERAMIC_URL = 'http://localhost:7007'
// Connect to the local Ceramic node
const ceramic = new Ceramic(CERAMIC_URL)

async function getJweSchema() {
  // Publish the two schemas
  const SchemaJWE = JSON.parse(await readFile(`${IdxFolder}/schemaJWE.json`));
  return publishSchema(ceramic, { content: SchemaJWE })
}

async function run() {
  // The seed must be provided as an environment variable
  const seed = fromString(process.env.CERAMIC_SEED, 'base16')

  // Authenticate the Ceramic instance with the provider
  await ceramic.setDIDProvider(new Ed25519Provider(seed))

  const schemaJwe = await getJweSchema();

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
  await writeFile(`${IdxFolder}/config.json`, JSON.stringify(config, null, 2))

  console.log('Config written to src/config.json file:', config)
  process.exit(0)
}

run().catch(console.error)
