import { mkdirSync, rmSync } from "node:fs";
import { URL } from "node:url";

export function useMockPaths() {
  const now = Date.now().toString();
  const packageFolder = new URL("..", import.meta.url).pathname;
  const testDbPath = `${packageFolder}/.cache/test${now}`;
  beforeEach(() => {
    mkdirSync(testDbPath, { recursive: true });
  })
  afterEach(() => {
    rmSync(testDbPath, { recursive: true });
  })

  const getDbProps = (suffix?: string) => ({
    rootFolder: testDbPath,
    dbname: `db-test-${suffix ?? crypto.randomUUID()}`,
    key: 'test',
    transformIn: (data) => data,
    transformOut: (data) => data,
  })
  return {
    testDbPath,
    getDbProps,
  };
}
