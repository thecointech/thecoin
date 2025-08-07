
import { log } from "@thecointech/logging";
import { getConfig } from "../config.js";
import { Agent } from '../../src/agent.js'
import { init } from "../init.js";
import { maybeCopyProfile, installBrowser } from "@thecointech/scraper/puppeteer";
import { AskUserConsole } from './askUserConsole.js'
import { TestSerializer } from './testSerializer.js'
import path from "path";
import { DateTime } from "luxon"
import { LoginFailedError } from "../../src/errors.js";
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

async function RunFailedLogin(agent: Agent, askUser: AskUserConsole) {
  const url = agent.page.page.url();
  // Don't record these events, they aren't relevant
  using _ = agent.events.pause();
  try {
    askUser.useBadLogin = true;
    await agent.process();
    // We shouldn't reach here
    throw new Error("Failed Login should throw")
  }
  catch (e) {
    const isLoginFailure = e instanceof LoginFailedError;
    // We _should_ have a login failure
    if (isLoginFailure) {
      // Go back to the start
      askUser.useBadLogin = false;
      await agent.page.page.goto(url)
      return true;
    }
    // Else, something has gone wrong, abandon ship
    throw e;
  }
}

for (const [name, bankConfig] of Object.entries(config)) {

  if (target && target != name) {
    continue;
  }

  try {

    // If this is our second run, we've already done the cookie banner and login
    const skipSections: SectionType[] = [];
    const logger = new TestSerializer({baseFolder: recordFolder, target: name, skipSections});
    using askUser = new AskUserConsole(bankConfig);

    // We want to write out all API calls and every found element
    await using agent = await Agent.create(name, askUser, bankConfig.url);

    if (testFailedLogin) {
      await RunFailedLogin(agent, askUser);
      skipSections.push("Landing", "CookieBanner", "Login");
    }
    // If we have no password, we can't do anything else
    if (bankConfig.password) {
      const events = await agent.process(skipSections);
      logger.logEvents(events);
    }
    successful.push(name);
  } catch (e) {
    errored.push(name);
  }
}

log.info(`Successful: ${successful.join(", ")}`);
log.info(`Failed: ${errored.join(", ")}`);
