import { init_node } from "./node";
import { describe } from "@thecointech/jestutils";
import { getEnvVars } from "@thecointech/setenv";
import { existsSync, rmSync } from "fs";
import { tmpdir } from "os";

describe('live test', () => {
  it('writes logs to disk in the correct location', async () => {
    // Load prodtest
    process.env.THECOIN_DATA = tmpdir();
    const vars = getEnvVars("prodtest");
    // overwrite testing env with prodtest
    // Don't use loadEnvVars because it does not
    // overwrite existing values
    process.env = vars;
    // Disable jest check
    delete process.env.JEST_WORKER_ID;
    // Disable remote logging
    delete process.env.URL_SEQ_LOGGING;
    const logger = init_node('test');
    logger.info('test');

    // Ensure streams are flushed by closing the logger
    await new Promise<void>((resolve) => {
      // @ts-ignore
      logger.streams.forEach(s => s.stream?.end?.());
      setTimeout(resolve, 100);
    });

    const logFolder = `${vars.TC_LOG_FOLDER}/test`;
    const logFile = `${logFolder}/tc.log`;
    expect(existsSync(logFile)).toBe(true);

    //@ts-ignore Close any remaining file handles
    logger.streams.forEach(s => s.stream?.destroy?.());

    // delete the folder and verify
    rmSync(logFolder, { recursive: true, force: true });
    expect(existsSync(logFolder)).toBe(false);
  })
})