import { jest } from '@jest/globals';
import { describe, IsManualRun} from '@thecointech/jestutils'
import { getClient } from '../internal/test-common';
import { getHistory } from './history';
import { getOneOffEncryptDid } from './oneOffDid';
import { getAdminDID } from '../internal/admin';

jest.setTimeout(5 * 60 * 1000);

describe('History', () => {
  it ('reads the full history', async () => {
    const {client, signer} = await getClient();
    const address = await signer.getAddress();
    const history = await getHistory(address, client, 15);
    expect(history.length > 1);

    const did = await getOneOffEncryptDid(client);
    const admindid = await getAdminDID();
    let decryped = 0;
    let failed = 0;
    for (const h of history) {
      // Admin should be able to decrypt
      try {
        const decr = await admindid.decryptDagJWE(h);
        console.log(decr);
      } catch {}
      // So should the client
      try {
        const decr = await did.decryptDagJWE(h);
        decryped++;
        console.log(decr);
      }
      catch (e) {
        failed++;
      }
    }
    expect(decryped).toBeGreaterThan(0);
  })
}, IsManualRun)
