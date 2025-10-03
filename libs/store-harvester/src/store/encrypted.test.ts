import { Mutex } from "@thecointech/async";
import { EncryptedDatabase } from "./encrypted";
import { jest } from "@jest/globals";
import { useMockPaths } from "../../mocked/paths";
import { exec } from 'child_process';

// test seems to take a long time when running in parallel with other tests.
jest.setTimeout(60000);

const { getDbProps } = useMockPaths();

it ('The encrypted db correctly releases its handles', async () => {

  const db = new EncryptedDatabase({
    ...getDbProps(),
    password: "1234",
  }, new Mutex());

  // First, set some data to force DB creation
  await db.set({
    test: "test",
  });
  const encryptedDbPath = `${db.dbPath}-encrypted/LOCK`;
  expect(await isOpen(encryptedDbPath)).toBe(false);

  await db.withDatabase(async () => {
    expect(await isOpen(encryptedDbPath)).toBe(true);
  });
  expect(await isOpen(encryptedDbPath)).toBe(false);

  // Double-check
  await db.withDatabase(async (db) => {
    expect(await isOpen(encryptedDbPath)).toBe(true);
  });
  expect(await isOpen(encryptedDbPath)).toBe(false);
})

const isOpen = (filePath: string): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    exec(`lsof "${filePath}"`, (err, stdout, stderr) => {
      if (err) {
        // File doesn't exist or other error - treat as not open
        resolve(false);
      } else {
        // If stdout has content, file is open
        // If stdout is empty, file exists but is not open
        const isFileOpen = stdout.trim().length > 0;
        resolve(isFileOpen);
      }
    });
  });
}
