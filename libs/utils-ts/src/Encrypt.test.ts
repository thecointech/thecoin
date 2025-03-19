import { encrypt } from './Encrypt';
import { decryptTo } from './Decrypt';

const testData = {
  test: "data to encrypt"
}

it ('can read/write using PK', async () => {

  const encrypted = encrypt(testData);
  expect(encrypted).not.toBeNull();
  const decrypted = await decryptTo<typeof testData>(encrypted);
  expect(decrypted.test).toEqual(testData.test);
})
