import { describe, IsManualRun } from '@thecointech/jestutils';
import { readFileSync } from 'fs';

describe('Pinata IPFS integration', () => {

  process.env.CONFIG_NAME = "prod";
  require('../../../../tools/setenv.js');


  it('uploads correctly', async () => {
    // Use prod so we pull in the proper credentials

    const f = readFileSync(__filename);
    // Dynamic import so it picks up the env vars set above
    const { upload } = await import('./ipfs');
    const r = await upload(f, "testf.txt");
    expect(r).toBeTruthy();
  })
}, IsManualRun)
