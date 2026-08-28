import electron from 'electron';
import { readFile, writeFile } from 'fs/promises';

export async function assertSafeStorage() {
  await electron.app?.whenReady();
  if (!electron.safeStorage.isEncryptionAvailable()) {
    throw new Error('safeStorage encryption is not available on this system');
  }
  if (process.platform === 'linux') {
    const backend = electron.safeStorage.getSelectedStorageBackend();
    if (backend === 'basic_text') {
      throw new Error('safeStorage is using the basic_text backend, which provides no OS-level key protection');
    }
  }
}

export async function getEncryptedFile(file: string): Promise<string> {
  await assertSafeStorage();
  const encrypted = await readFile(file);
  return electron.safeStorage.decryptString(Buffer.from(encrypted));
}

export async function setEncryptedFile(file: string, data: string): Promise<void> {
  await assertSafeStorage();
  const encrypted = electron.safeStorage.encryptString(data);
  await writeFile(file, new Uint8Array(encrypted));
}
