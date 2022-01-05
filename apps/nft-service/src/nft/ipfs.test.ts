import { describe, IsManualRun } from '@thecointech/jestutils';
import { readFileSync } from 'fs';

describe('Pinata IPFS integration', () => {

  process.env.CONFIG_NAME = "prod";
  require('@thecointech/setenv');


  it('uploads correctly', async () => {
    // Use prod so we pull in the proper credentials

    const f = readFileSync(__filename);
    // Dynamic import so it picks up the env vars set above
    const { upload } = await import('./ipfs');
    const r = await upload(f, "avatar.jpg");
    expect(r).toBeTruthy();
  })
}, IsManualRun)
