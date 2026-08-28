import { existsSync } from 'fs';
import path from 'path';
import { randomBytes } from 'node:crypto';
import { log } from '@thecointech/logging';
import { rootFolder } from './paths';
import { getEncryptedFile, setEncryptedFile } from './Harvester/safeStorage';

const passwordFile = path.join(rootFolder, 'config-key.bin');

export async function getSecureConfigPassword(): Promise<string> {
  if (existsSync(passwordFile)) {
    return getEncryptedFile(passwordFile);
  }

  const password = randomBytes(32).toString('base64');
  await setEncryptedFile(passwordFile, password);

  log.info({ path: passwordFile }, 'Generated new secure config encryption key');
  return password;
}
