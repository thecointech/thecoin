import { ConfigShape, hydrateProcessor } from './config';
import { initialize, setProcessConfig } from './db';
import { RoundUp } from './RoundUp';
import { TransferLimit } from './TransferLimit';
import { TransferVisaOwing } from './TransferVisaOwing';

import PouchDB from 'pouchdb'
import memory from 'pouchdb-adapter-memory'

beforeAll(() => {
  // add the adapter to PouchDB
  PouchDB.plugin(memory)
})

beforeEach(() => {
  initialize({adapter: 'memory'});
})

it ('Can save & load a config', async () => {
  

  const config: ConfigShape = {
    stages: [
      {
        name: 'transferVisaOwing',
      },
      {
        name: 'roundUp',
        args: {
          roundPoint: 50,
        },
      },
      {
        name: 'transferLimit',
        args: {
          limit: 200,
        },
      },
    ]
  };

  // save the config
  await setProcessConfig(config);

  // Reload it

  const stages = await hydrateProcessor();

  expect(stages?.length).toBe(3);
  expect(stages?.[0]).toBeInstanceOf(TransferVisaOwing)
  expect(stages?.[1]).toBeInstanceOf(RoundUp)
  expect(stages?.[2]).toBeInstanceOf(TransferLimit)

  expect((stages?.[1] as RoundUp).roundPoint).toBe(50);
})