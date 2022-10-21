import { generateKeyPair } from 'crypto';
import { decryptTo, encrypt } from './Encrypt';

const testObj = {
  val: "I am a string",
  subobj: {
    val: "Suboject here"
  }
}

it('Encrypts and decrypts correctly', () => {
  generateKeyPair('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: 'top secret'
    }
  }, (_, publicKey, privateKey) => {
    const encrypted = encrypt(testObj, publicKey);
    const decrypted = decryptTo<typeof testObj>(privateKey, encrypted);

    expect(decrypted).toMatchObject(testObj);
  })
});
