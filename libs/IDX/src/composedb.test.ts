import { jest } from '@jest/globals';
import { getClient } from '../internal/test-common';
import { describe, IsManualRun } from '@thecointech/jestutils';
jest.setTimeout(30 * 1000);

describe('ComposeDB', () => {
  it ('correctly authorizes', async () => {
    const {client} = await getClient();
    expect(client.id).toEqual("did:pkh:eip155:31337:0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
  })
}, IsManualRun)
