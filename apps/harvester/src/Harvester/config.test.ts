import { jest } from '@jest/globals';
import { initialize, ConfigShape, hydrateProcessor, setProcessConfig, getProcessConfig } from './config';
import { RoundUp } from './RoundUp';
import { TransferLimit } from './TransferLimit';
import { TransferVisaOwing } from './TransferVisaOwing';

jest.setTimeout(60000);

// it ('Correctly encrypts', async () => {
//   await initialize('password');

//   // Get current
//   const cfg = await getProcessConfig();
//   const now = Date.now();
//   await setProcessConfig({
//     stages: [],
//     wallet: 'wallet' + now,

//   });

//   const cfg2 = await getProcessConfig();
//   expect (cfg2?.wallet).toEqual('wallet' + now);
// })

it ('Can save & load a config', async () => {

  await initialize();

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
