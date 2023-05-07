import { getOneOffEncryptDid } from './oneOffDid';
import { getClient } from '../internal/test-common';

it ('creates a DID', async () => {
  const client = await getClient();
  const did = await getOneOffEncryptDid(client);
  expect(did.authenticated).toBe(true);
})
