
import { log } from "@thecointech/logging";
import { getConfig } from "../config.js";
import { Agent } from '../../src/agent.js'
import { init } from "../init.js";
import { maybeCopyProfile, installBrowser, newPage } from "@thecointech/scraper/puppeteer";
import { AskUserConsole } from './askUserConsole.js'
import { TestSerializer } from './testSerializer.js'
import path from "path";
import { DateTime } from "luxon"
import { LoginFailedError } from "../../src/errors.js";
import { DummyAskUser } from "./dummyAskUser.js";
import type { SectionType } from "../../src/processors/types.js";

const { baseFolder, config } = getConfig();

const clean = process.argv.includes("clean");
const testFailedLogin = process.argv.includes("test-fail-login");
const target = process.argv.includes("--target") ? process.argv[process.argv.indexOf("--target") + 1] : undefined;

const dateSuffix = DateTime.now().toFormat("yyyy-MM-dd_HH-mm");
const recordFolder = path.join(baseFolder, "record-" + dateSuffix);

await init();
await installBrowser();
await maybeCopyProfile(clean);

let successful: string[] = [];
let errored: string[] = [];

for (const [name, bankConfig] of Object.entries(config)) {

  if (target && target != name) {
    continue;
  }

  const skipSections: SectionType[] = [];
  if (testFailedLogin) {
    const askUser = new DummyAskUser(bankConfig.bad_credentials);
    const logger = new TestSerializer({baseFolder: recordFolder + "", target: name});
    try {
      await Agent.process(name, bankConfig.url, askUser, logger);
    }
    catch (e) {
      if (e instanceof LoginFailedError) {
        // This is expected, continue as normal
      }
      // This is not
      throw e;
    }
    // If we don't have a valid password, mark this target complete
    if (!bankConfig.password) {
      successful.push(name);
      continue;
    }
    // Do not re-record login and cookie banner over existing
    skipSections.push("Login", "CookieBanner");
  }

  try {

    using askUser = new AskUserConsole(bankConfig);
    const logger = new TestSerializer({baseFolder: recordFolder, target: name, skipSections});

    const events = await Agent.process(name, bankConfig.url, askUser, logger);
    successful.push(name);

    logger.logEvents(events);
  } catch (e) {
    errored.push(name);
  }
}

log.info(`Successful: ${successful.join(", ")}`);
log.info(`Failed: ${errored.join(", ")}`);
