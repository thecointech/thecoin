
import { log } from "@thecointech/logging";
import { getConfig } from "../config.js";
import { Agent } from '../../src/agent.js'
import { init } from "../init.js";
import { AskUserConsole } from './askUserConsole.js'
import { TestSerializer } from './testSerializer.js'
import path from "path";

const { baseFolder, config } = getConfig();

const clean = process.argv.includes("clean");
const testFailedLogin = process.argv.includes("test-fail-login");
const target = process.argv.includes("--target") ? process.argv[process.argv.indexOf("--target") + 1] : undefined;
const recordFolder = path.join(baseFolder, "record");

await init(clean);

let successful: string[] = [];
let errored: string[] = [];

for (const [name, bankConfig] of Object.entries(config)) {

  if (target && target != name) {
    continue;
  }

  using askUser = new AskUserConsole(bankConfig);
  const logger = new TestSerializer({baseFolder: recordFolder, target: name});

  try {
    const events = await Agent.process(name, bankConfig.url, askUser, logger, (progress) => {
      console.log(`Step ${progress.section} of ${progress.totalSections}: ${progress.sectionPercent}`);
    });
    successful.push(name);

    logger.logEvents(events);
  } catch (e) {
    errored.push(name);
  }
}

log.info(`Successful: ${successful.join(", ")}`);
log.info(`Failed: ${errored.join(", ")}`);
