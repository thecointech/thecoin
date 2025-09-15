import { mkdirSync, rmSync } from "node:fs";

export function useMockPaths() {
  const now = Date.now().toString();

  const testDbPath = `./.cache/test${now}`;
  beforeEach(() => {
    mkdirSync(testDbPath, { recursive: true });
  })
  afterEach(() => {
    rmSync(testDbPath, { recursive: true });
  })

  return {
    testDbPath,
    now,
  };
}
