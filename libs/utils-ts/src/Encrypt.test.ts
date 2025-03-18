import { decryptTo, encrypt } from './Encrypt';

const testData = {
  test: "data to encrypt"
}

it ('can read/write using PK', async () => {

  const encrypted = encrypt(testData);
  expect(encrypted).not.toBeNull();
  const decrypted = await decryptTo<typeof testData>(encrypted);
  expect(decrypted.test).toEqual(testData.test);
})
