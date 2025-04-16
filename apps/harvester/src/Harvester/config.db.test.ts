import { jest } from '@jest/globals';
import { getConfig, getDbPath } from './config.db';
import { getProcessConfig, setProcessConfig } from './config';
import { existsSync, rmSync } from 'fs';
import { describe, IsManualRun } from '@thecointech/jestutils';

jest.setTimeout(60000);

const now = Date.now().toString();
const cgfData = {
  creditDetails: {
    payee: 'wallet',
    accountNumber: now,
  }
};

it ('Can round-trip data', async () => {
  await getConfig('password');

  // Get current
  await setProcessConfig(cgfData);

  const cfg2 = await getProcessConfig();
  expect (cfg2?.creditDetails?.accountNumber).toEqual(now);
})

describe("Experimenting with loadDecrypted/conflicts", () => {
  it ('correctly persists' , async () => {
    // This test only seems to work when debugging directly.
    // Also, because closing the DB doesn't seem to work,
    // we can't validate persistence without running twice
    const db_name = `config-testing.db`;
    const path = getDbPath(db_name) + '-encrypted';
    const exists = existsSync(path);

    const willRemove = false; //exists && Date.now() % 2 === 0;
    if (exists && willRemove) {
      rmSync(path, { recursive: true });
    }
    const db = await getConfig('password', true, db_name);
    const cfg = await getProcessConfig();
    // The only tests that matter are against a DB that already exists
    if (exists) {
      if (!willRemove) {
        // Did all the inserts get committed?
        expect(cfg.stateKey).toEqual("4");
      }
    }
    // Try setting the data, release DB
    await setProcessConfig({ stateKey: "1"});
    await db.loadDecrypted(); // Force state to reload
    await setProcessConfig({ stateKey: "2"});
    await setProcessConfig({ stateKey: "3"});
    await setProcessConfig({ stateKey: "4"});
    // await db.close();
  })
}, IsManualRun)

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
