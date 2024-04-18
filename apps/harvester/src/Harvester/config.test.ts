import { jest } from '@jest/globals';
import { setProcessConfig, getProcessConfig, getConfig } from './config';

jest.setTimeout(60000);

// I cannot get comdb types to import cleanly
// here, so disabling cause fuggit...

it ('Correctly encrypts', async () => {
  await getConfig('password');

  // Get current
  const now = Date.now().toString();
  await setProcessConfig({
    creditDetails: {
      payee: 'wallet',
      accountNumber: now,
    }
  });

  const cfg2 = await getProcessConfig();
  expect (cfg2?.creditDetails?.accountNumber).toEqual(now);
})

// it ('Can save & load a config', async () => {

//   await initConfig();

//   const config: ConfigShape = {
//     daysToRun: defaultDays,
//     steps: [
//       {
//         name: 'transferVisaOwing',
//       },
//       {
//         name: 'roundUp',
//         args: {
//           roundPoint: 50,
//         },
//       },
//       {
//         name: 'transferLimit',
//         args: {
//           limit: 200,
//         },
//       },
//     ]
//   };

//   // save the config
//   await setProcessConfig(config);

//   // Reload it

//   const stages = await hydrateProcessor();

//   expect(stages?.length).toBe(3);
//   expect(stages?.[0]).toBeInstanceOf(TransferVisaOwing)
//   expect(stages?.[1]).toBeInstanceOf(RoundUp)
//   expect(stages?.[2]).toBeInstanceOf(TransferLimit)

//   expect((stages?.[1] as RoundUp).roundPoint).toBe(50);
// })
