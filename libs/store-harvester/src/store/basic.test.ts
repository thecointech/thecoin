import { BasicDatabase } from "./basic";
import { useMockPaths } from "../../mocked/paths";
import { Mutex } from "@thecointech/async";

const { testDbPath } = useMockPaths();
it('Should prevent concurrent withDatabase calls', async () => {
  const db = new BasicDatabase({
    rootFolder: testDbPath,
    dbname: 'concurrency-test',
    key: 'test',
    transformIn: (data) => data,
    transformOut: (data) => data,
  }, new Mutex());

  // Track the order of operations
  const operationOrder: string[] = [];
  let activeOperations = 0;
  let maxConcurrentOperations = 0;

  // Create multiple concurrent operations that should be serialized
  const operations = Array.from({ length: 5 }, (_, i) =>
    db.withDatabase(async (database) => {
      activeOperations++;
      maxConcurrentOperations = Math.max(maxConcurrentOperations, activeOperations);

      operationOrder.push(`start-${i}`);

      // Simulate some async work
      await new Promise(resolve => setTimeout(resolve, 50));

      operationOrder.push(`end-${i}`);
      activeOperations--;

      return i;
    })
  );

  // Wait for all operations to complete
  const results = await Promise.all(operations);

  // Verify all operations completed
  expect(results).toEqual([0, 1, 2, 3, 4]);

  // This test will FAIL initially because concurrent operations are allowed
  // After implementing the gate, only 1 operation should be active at a time
  expect(maxConcurrentOperations).toBe(1);

  // Verify operations were serialized (each start should be followed by its end)
  for (let i = 0; i < 5; i++) {
    const startIndex = operationOrder.indexOf(`start-${i}`);
    const endIndex = operationOrder.indexOf(`end-${i}`);
    expect(startIndex).toBeLessThan(endIndex);

    // No other operation should start between this operation's start and end
    const betweenOperations = operationOrder.slice(startIndex + 1, endIndex);
    const otherStarts = betweenOperations.filter(op => op.startsWith('start-'));
    expect(otherStarts).toHaveLength(0);
  }
})
