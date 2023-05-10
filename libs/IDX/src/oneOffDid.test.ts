import { getOneOffEncryptDid } from './oneOffDid';
import { getClient } from '../internal/test-common';
import { describe, IsManualRun } from '@thecointech/jestutils';

describe('OneOffDid', () => {
  it ('creates a DID', async () => {
    const {client} = await getClient();
    const did = await getOneOffEncryptDid(client);
    expect(did.authenticated).toBe(true);
  })
}, IsManualRun)
