import { describe, IsManualRun } from '@thecointech/jestutils';
import { readFileSync } from 'fs';
import { getEnvVars } from '@thecointech/setenv';

const prodVars = getEnvVars("prod");
process.env = prodVars;

describe('Pinata IPFS integration', () => {

  it('uploads correctly', async () => {
    const f = readFileSync(__filename);
    // Dynamic import so it picks up the env vars set above
    const { upload } = await import('./ipfs');
    const r = await upload(f, "avatar.jpg");
    expect(r).toBeTruthy();
  })
}, IsManualRun)
