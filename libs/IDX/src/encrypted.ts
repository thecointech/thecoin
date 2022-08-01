import { SelfID } from '@self.id/web'
import { IdxAlias } from './types';

export interface EncryptedPayload<T> {
  // It is legal for the data to be null
  // (for example, the client wipes their account)
  data: T|null,
  recipients: string[],
}

// Call to set some data to an encrypted
// IDX definition on the users account
export const setEncrypted = async <T>(self: SelfID, definition: IdxAlias, data: T|null, recipients = [] as string[]) => {

  const owners = new Set([self.id, ...recipients]) // always make ourselves a recipient
  const did = self.client.ceramic.did!;
  // Remember who has access to this record
  const payload: EncryptedPayload<T> = {
    data: cleanUndefined(data),
    recipients,
  }
  const encrypted = await did.createDagJWE(payload, [...owners])
  const id = await self.set(definition, encrypted);
  return id;
}

// Load the encrypted record and decrypt
export const loadEncrypted = async <T>(self: SelfID, definition: IdxAlias) : Promise<EncryptedPayload<T>|null> => {
  const did = self.client.ceramic.did!;
  const record = await self.get(definition);
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

const cleanUndefined = (obj: any) =>
  typeof(obj) === 'object'
    ? Object.keys(obj).reduce((acc, key) => (
        obj[key] === undefined
          ? acc
          : { ...acc, [key]: obj[key] }
      ), {} as any)
    : obj;


