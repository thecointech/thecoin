import { jest } from '@jest/globals';
import { getDbPath, withConfigDatabase } from './config.db';
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
  // Get current
  await setProcessConfig(cgfData);
  const cfg2 = await getProcessConfig();
  expect (cfg2?.creditDetails?.accountNumber).toEqual(now);
})

it ('Works with encrypted DB', async () => {
  // This enables encrypted DB, and sets it's name
  process.env.CONFIG_NAME = `dev-encrypted-${now}`;

  await setProcessConfig(cgfData);
  const cfg = await getProcessConfig();
  expect (cfg?.creditDetails?.accountNumber).toEqual(now);

  for (let i = 0; i < 4; i++) {
    cgfData.creditDetails.accountNumber = i.toString();
    await setProcessConfig(cgfData);
    const cfg2 = await getProcessConfig();
    expect (cfg2?.creditDetails?.accountNumber).toEqual(i.toString());
  }
  // This exists on disk, should be removed
  rmSync(getDbPath());
});
