import { log } from "./log_node"
import { LoggerContext } from "./loggerContext"

it ("correctly adds a child node", () => {

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
