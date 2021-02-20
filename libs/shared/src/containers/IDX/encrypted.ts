import { IDX } from '@ceramicstudio/idx';
import type { JWE } from 'did-jwt';
import { IdxAlias, getDID } from './idx';

export interface EncryptedPayload<T> {
  // It is legal for the data to be null
  // (for example, the client wipes their account)
  data: T|null,
  recipients: string[],
}

// Call to set some data to an encrypted
// IDX definition on the users account
export const setEncrypted = async <T>(idx: IDX, definition: IdxAlias, data: T|null, recipients = [] as string[]) => {

  const owners = new Set([idx.id, ...recipients]) // always make ourselves a recipient
  const did = getDID();
  // Remember who has access to this record
  const payload: EncryptedPayload<T> = {
    data,
    recipients,
  }
  const encrypted = await did.createDagJWE(payload, [...owners])
  const id = await idx.set(definition, encrypted);
  return id;
}

// Load the encrypted record and decrypt
export const loadEncrypted = async <T>(idx: IDX, definition: IdxAlias) : Promise<EncryptedPayload<T>|null> => {
  const did = getDID();
  const record = await idx.get<JWE>(definition);
  if (record) {
    try {
      const decrypted = await did.decryptDagJWE(record);
      return decrypted as EncryptedPayload<T>;
    } catch (e) {
      console.error(e);
    }
  }
  return null;
}
