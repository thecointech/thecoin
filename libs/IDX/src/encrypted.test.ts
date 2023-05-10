import { jest } from '@jest/globals';
import { getAdminDID } from '../internal/admin';
import { getClient } from '../internal/test-common';
import { getEncrypted, loadEncrypted, setEncrypted } from './encrypted';
import { getOneOffEncryptDid } from './oneOffDid';
import { describe, IsManualRun} from '@thecointech/jestutils'

jest.setTimeout(120 * 1000);

describe('encryption tests', () => {
  it ("can save/load encrypted data", async () => {

    const initial = {
      name: "I am a Pickle",
      sin: "123-456-789",
      address: "123 Main St",
      more: {
        anything: "can be put in here"
      }
    };
    // Scope to ensure we create a new session each time
    {
      const {client} = await getClient();
      await setEncrypted(client, initial);
    }
    {
      const {client} = await getClient();
      const r1 = await loadEncrypted(client);
      expect(r1).toEqual(initial);
    }
    {
      // What happens when we update it?
      const {client} = await getClient();
      initial.sin = "something else";
      await setEncrypted(client, initial);
      const r2 = await loadEncrypted(client);
      expect(r2).toEqual(initial);
    }
  })

  it ("can share read-only access with admin", async () => {

    const {client} = await getClient();
    const clientDid = await getOneOffEncryptDid(client);
    const adminDid = await getAdminDID();

    const initial = {
      name: "I am a Pickle",
      sin: "123-456-789",
      date: new Date().toISOString(),
      address: "123 Main St",
      more: {
        anything: "can be put in here"
      }
    };
    await setEncrypted(client, initial, [adminDid.id]);

    const jwe = await getEncrypted(client);
    const v1 = await adminDid.decryptDagJWE(jwe);
    const v2 = await clientDid.decryptDagJWE(jwe);
    expect(v1).toEqual(v2);
  })
}, IsManualRun)
