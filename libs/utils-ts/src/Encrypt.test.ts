import { decryptTo, encrypt } from './Encrypt';

const testData = {
  test: "data to encrypt"
}

it ('can read/write using PK', async () => {

  const encrypted = encrypt(testData);
  expect(encrypted).not.toBeNull();

  // We currently use a private key stored on the file-system.  We very
  // much should switch to using a secrets manager for this
  const decrypted = await decryptTo<typeof testData>(encrypted);
  expect(decrypted.test).toEqual(testData.test);
})
