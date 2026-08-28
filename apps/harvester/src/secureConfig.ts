import { app, safeStorage } from 'electron';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'node:crypto';
import { log } from '@thecointech/logging';
import { rootFolder } from './paths';

const passwordFile = path.join(rootFolder, 'config-key.bin');

// Apply minimal protection to the config data.
export async function getSecureConfigPassword(): Promise<string> {
  // safeStorage may only be used once the app is ready.
  await app.whenReady();

  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('safeStorage encryption is not available on this system');
  }

  const backend = safeStorage.getSelectedStorageBackend();
  if (backend === 'basic_text') {
    throw new Error('safeStorage is using the basic_text backend, which provides no OS-level key protection');
  }

  if (existsSync(passwordFile)) {
    const encrypted = await readFile(passwordFile);
    return safeStorage.decryptString(Buffer.from(encrypted));
  }

  const password = randomBytes(32).toString('base64');
  const encrypted = safeStorage.encryptString(password);
  await writeFile(passwordFile, new Uint8Array(encrypted));

  log.info({ path: passwordFile }, 'Generated new secure config encryption key');
  return password;
}
