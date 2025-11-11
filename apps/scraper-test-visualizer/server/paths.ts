import { existsSync } from "node:fs";
import { join } from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export function getTestPath() {
  const testingPages = process.env.PRIVATE_TESTING_PAGES;

  if (!testingPages) {
    console.error('⚠️  PRIVATE_TESTING_PAGES environment variable not set');
    console.error('   Please set it to the path of your test data directory');
    process.exit(1);
  }

  if (!existsSync(testingPages)) {
    console.error(`⚠️  PRIVATE_TESTING_PAGES directory does not exist: ${testingPages}`);
    process.exit(1);
  }

  console.log(`📁 Using test data from: ${testingPages}`);
  return testingPages;
}

export function getArchivePath(testPath: string) {
  return join(testPath, 'archive');
}

export async function openFolderInBrowser(folderPath: string): Promise<void> {
  if (!existsSync(folderPath)) {
    throw new Error(`Folder does not exist: ${folderPath}`);
  }

  try {
    // Use xdg-open for Linux
    await execAsync(`xdg-open "${folderPath}"`);
  } catch (error) {
    throw new Error(`Failed to open folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
