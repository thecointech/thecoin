
import { log } from "@thecointech/logging";
import { getConfig } from "../config.js";
import { Agent } from '../../src/agent.js'
import { init } from "../init.js";
import { setupScraper } from "@thecointech/scraper/puppeteer-init/setup";
import { AskUserConsole } from './askUserConsole.js'
import { TestSerializer } from './testSerializer.js'
import path from "path";

// process.env.URL_SERVICE_VQA="http://127.0.0.1:7004";

const { baseFolder, config } = getConfig();

const clean = process.argv.includes("clean");
const testFailedLogin = process.argv.includes("test-fail-login");
const target = process.argv.includes("--target") ? process.argv[process.argv.indexOf("--target") + 1] : undefined;
const recordFolder = path.join(baseFolder, "record");

await init(clean);
await setupScraper();
process.env.RUN_SCRAPER_HEADLESS = "false";
let successful: string[] = [];
let errored: string[] = [];

for (const [name, bankConfig] of Object.entries(config)) {

  if (target && target != name) {
    continue;
  }

  using askUser = new AskUserConsole(bankConfig);
  const logger = new TestSerializer({baseFolder: recordFolder, target: name});

  try {
    const events = await Agent.process(name, bankConfig.url, askUser, logger);
    successful.push(name);

    logger.logEvents(events);
  } catch (e) {
    errored.push(name);
  }
}

log.info(`Successful: ${successful.join(", ")}`);
log.info(`Failed: ${errored.join(", ")}`);
