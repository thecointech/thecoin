import { log } from "./log_node"
import { LoggerContext } from "./loggerContext"

it("correctly adds a child node", () => {

  const baseStream: any[] = []
  const childStream: any[] = []

  log.addStream({
    stream: {
      write(r: any) {
        baseStream.push(JSON.parse(r));
      },
    }
  })
  log.info("See me?");
  expect(baseStream[0].msg).toBe("See me?")

  {
    const context = new LoggerContext({
      context: "test-child",
      src: true,
      stream: {
        write(r: any) {
          childStream.push(JSON.parse(r))
        }
      }
    })
    log.info("See me 2");

    // Manual disposal
    context.dispose();
  }
  expect(baseStream[1].msg).toBe("See me 2");
  expect(baseStream[1].context).toBe("test-child");
  expect(childStream[0].msg).toBe("See me 2");
  expect(childStream[0].context).toBe("test-child");

  log.info("See me 3");
  expect(baseStream[2].msg).toBe("See me 3");
  expect(baseStream[2].context).toBeUndefined();
  expect(childStream.length).toBe(1)
})

it("correctly isolates contexts in concurrent async operations", async () => {
  const capturedLogs: any[] = [];
  log.addStream({
    stream: {
      write(r: any) {
        capturedLogs.push(JSON.parse(r));
      },
    }
  });

  const runAsyncTask = async (id: string, delay: number) => {
    return await LoggerContext.run(async () => {
      using _ = new LoggerContext({ id });
      log.info(`Start ${id}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      log.info(`End ${id}`);
      return id;
    });
  };

  // Run 3 tasks concurrently with different IDs and delays
  await Promise.all([
    runAsyncTask("task-A", 50),
    runAsyncTask("task-B", 20),
    runAsyncTask("task-C", 80),
  ]);

  // We expect 6 logs (Start/End for A, B, C)
  // Each log must have the CORRECT id in its context
  const taskALogs = capturedLogs.filter(l => l.msg.includes("task-A"));
  const taskBLogs = capturedLogs.filter(l => l.msg.includes("task-B"));
  const taskCLogs = capturedLogs.filter(l => l.msg.includes("task-C"));

  expect(taskALogs).toHaveLength(2);
  expect(taskALogs.every(l => l.id === "task-A")).toBe(true);

  expect(taskBLogs).toHaveLength(2);
  expect(taskBLogs.every(l => l.id === "task-B")).toBe(true);

  expect(taskCLogs).toHaveLength(2);
  expect(taskCLogs.every(l => l.id === "task-C")).toBe(true);
});
