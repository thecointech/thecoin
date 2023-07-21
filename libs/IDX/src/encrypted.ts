import type { ComposeClient } from '@composedb/client';
import type { JWE } from 'did-jwt';
import { log } from '@thecointech/logging';
import { getOneOffEncryptDid } from './oneOffDid';

// Call to set some data to an encrypted
// IDX definition on the users account
export const setEncrypted = async <T>(client: ComposeClient, data: T, recipients = [] as string[]) => {

  const did = client.did;
  if (!did) {
    throw new Error("Cannot set encrypted record without DID")
  }

  const oneOffDid = await getOneOffEncryptDid(client);
  // always make ourselves a recipient
  const owners = new Set([oneOffDid.id, ...recipients])
  // remove any undefined values from the data
  const clean = cleanUndefined(data);
  if (!clean) { return }

  const encrypted = await oneOffDid.createDagJWE(clean, [...owners])

  // If doc exists, update rather than create new one
  // (this doesn't seem to matter, but it sounds better)
  const exists = await getEncrypted(client);
  const r = exists
    ? await updateRecord(client, encrypted, exists.id)
    : await createRecord(client, encrypted);

  if (r.errors) {
    log.error(JSON.stringify(r.errors));
    throw new Error("Failed writing encrypted record");
  }
}

const createRecord = (client: ComposeClient, encrypted: JWE) =>
  client.executeQuery(`mutation CreateProfile($i: CreateEncryptedProfileInput!) {
    createEncryptedProfile(input: $i) {
      document {
        ${encryptedDocument}
      }
    }
  }`,
  {
    i: {
      content: encrypted
    }
  })

const updateRecord = (client: ComposeClient, encrypted: JWE, id: string) =>
  client.executeQuery(`mutation UpdateProfile($i: UpdateEncryptedProfileInput!) {
    updateEncryptedProfile(input: $i) {
      document {
        ${encryptedDocument}
      }
    }
  }`,
  {
    i: {
      id,
      content: encrypted
    }
  })

export const getEncrypted = async (client: ComposeClient) => {
  try {
    const r = await client.executeQuery<{
      viewer: {
        encryptedProfile: JWE & { id: string }
      }
    }>(`
      query GetProfile {
        viewer {
          encryptedProfile {
            ${encryptedDocument}
          }
        }
      }`
    );

    if (r.errors) {
      log.error("Error getting encrypted record", JSON.stringify(r.errors));
    }
    return r.data?.viewer.encryptedProfile ?? null;
  }
  catch (err) {
    if (err instanceof Error)
      log.error(err, "Error getting encrypted record");
    else log.error("Error getting encrypted record: ", JSON.stringify(err));
    return null;
  }
}

// Load the encrypted record and decrypt
export const loadEncrypted = async <T>(client: ComposeClient) : Promise<T|null> => {

  const oneOffDid = await getOneOffEncryptDid(client);
  if (!oneOffDid) {
    throw new Error("Cannot read encrypted record without DID")
  }

  const encrypted = await getEncrypted(client);
  if (encrypted) {
    try {
      const decrypted = await oneOffDid.decryptDagJWE(encrypted);
      return decrypted as T;
    } catch (e) {
      if (e instanceof Error) {
        log.error(e, "Failed decrypting record");
      }
      log.error("Unknown error decrypting record: ", JSON.stringify(e));
    }
  }
  else {
    log.debug("No encrypted record found");
  }
  return null;
}

const cleanUndefined = <T>(obj: T) : T|undefined => {
  if (obj && typeof obj === 'object') {
    const r = Object.fromEntries(
      Object
        .entries(obj)
        .map(([key, value]) => [key, cleanUndefined(value)])
        .filter(([_key, value]) => value !== undefined && value !== null)
    );
    // remove empty objects
    return (Object.keys(r).length === 0)
      ? undefined
      : r;
  }
  return obj;
}


const encryptedDocument = `
id
iv
aad
tag
protected
ciphertext
recipients {
  encrypted_key
  header {
    alg
    iv
    kid
    tag
    epk {
      crv
      kty
      x
    }
  }
}`
