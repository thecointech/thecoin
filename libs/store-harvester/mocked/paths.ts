import { mkdirSync, rmSync } from "node:fs";

export function useMockPaths() {
  const now = Date.now().toString();

  const testDbPath = `./.cache/test${now}`;
  beforeAll(() => {
    mkdirSync(testDbPath, { recursive: true });
  })
  afterAll(() => {
    rmSync(testDbPath, { recursive: true });
  })

  return {
    testDbPath,
    now,
  };
}
