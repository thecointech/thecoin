import { existsSync } from "node:fs";
import { join } from "node:path";

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
