const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'debug.env')});

const { writeFile, readFile } = require('fs').promises
const Ceramic = require('@ceramicnetwork/http-client').default
const { createDefinition, publishSchema } = require('@ceramicstudio/idx-tools')
const { Ed25519Provider } = require('key-did-provider-ed25519')
const fromString = require('uint8arrays/from-string');

const IdxFolder = path.join(__dirname, '..', 'libs', 'shared', 'src', 'containers', 'IDX');
const CERAMIC_URL = 'http://localhost:7007'

// const NoteSchema = {
//   $schema: 'http://json-schema.org/draft-07/schema#',
//   title: 'Note',
//   type: 'object',
//   properties: {
//     date: {
//       type: 'string',
//       format: 'date-time',
//       title: 'date',
//       maxLength: 30,
//     },
//     text: {
//       type: 'string',
//       title: 'text',
//       maxLength: 4000,
//     },
//   },
// }

// const NotesListSchema = {
//   $schema: 'http://json-schema.org/draft-07/schema#',
//   title: 'NotesList',
//   type: 'object',
//   properties: {
//     notes: {
//       type: 'array',
//       title: 'notes',
//       items: {
//         type: 'object',
//         title: 'NoteItem',
//         properties: {
//           id: {
//             $ref: '#/definitions/CeramicDocId',
//           },
//           title: {
//             type: 'string',
//             title: 'title',
//             maxLength: 100,
//           },
//         },
//       },
//     },
//   },
//   definitions: {
//     CeramicDocId: {
//       type: 'string',
//       pattern: '^ceramic://.+(\\\\?version=.+)?',
//       maxLength: 150,
//     },
//   },
// }

async function run() {
  // The seed must be provided as an environment variable
  const seed = fromString(process.env.CERAMIC_SEED, 'base16')
  // Connect to the local Ceramic node
  const ceramic = new Ceramic(CERAMIC_URL)
  // Authenticate the Ceramic instance with the provider
  await ceramic.setDIDProvider(new Ed25519Provider(seed))

  // Publish the two schemas
  const NotesSchema = JSON.parse(await readFile(`${IdxFolder}/schema.json`));

  const [notesSchema, _notesListSchema] = await Promise.all([
    publishSchema(ceramic, { content: NotesSchema }),
    //publishSchema(ceramic, { content: NotesListSchema }),
  ])

  // Create the definition using the created schema ID
  const notesDefinition = await createDefinition(ceramic, {
    name: 'notes',
    description: 'Simple text notes',
    schema: notesSchema.commitId.toUrl(),
  })

  // Write config to JSON file
  const config = {
    definitions: {
      notes: notesDefinition.id.toString(),
    },
    schemas: {
      Notes: notesSchema.commitId.toUrl(),
      //NotesList: notesListSchema.commitId.toUrl(),
    },
  }
  await writeFile(`${IdxFolder}/config.json`, JSON.stringify(config))

  console.log('Config written to src/config.json file:', config)
  process.exit(0)
}

run().catch(console.error)
