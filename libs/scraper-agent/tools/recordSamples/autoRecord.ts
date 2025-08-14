
import { log } from "@thecointech/logging";
import { BankConfig, getConfig } from "../config.js";
import { Agent } from '../../src/agent.js'
import { init } from "../init.js";
import { maybeCopyProfile, installBrowser } from "@thecointech/scraper/puppeteer";
import { AskUserConsole } from './askUserConsole.js'
import { TestSerializer } from './testSerializer.js'
import path from "path";
import { DateTime } from "luxon"
import { LoginFailedError } from "../../src/errors.js";
import { updateRecordLatest } from "./updateRecordLatest"
import type { SectionType } from "../../src/processors/types.js";
import { DummyAskUser } from "./dummyAskUser.js";

const { baseFolder, config } = getConfig();

const clean = process.argv.includes("clean");
const testFailedLogin = process.argv.includes("test-fail-login");
const target = process.argv.includes("--target") ? process.argv[process.argv.indexOf("--target") + 1] : undefined;

const dateSuffix = DateTime.now().toFormat("yyyy-MM-dd_HH-mm");
const recordFolder = path.join(baseFolder, "record-archive", dateSuffix);

await init();
await installBrowser();
await maybeCopyProfile(clean);

let successful: string[] = [];
let errored: string[] = [];

const failLoginTarget = (name: string) => name + "FailLogin"

function addLogStream(name) {
  log.addStream({
    stream: new RotatingFileStream({
      path: `${logsFolder}/harvest.log`,
      count: 10,
      period: "1d",
    }),
    level: "trace",
  })
  return
}
async function RunFailedLogin(name: string, config: BankConfig) {
  const askUser = new DummyAskUser(config.bad_credentials);
  const failName = failLoginTarget(name);
  using _ = new TestSerializer({baseFolder: recordFolder, target: failName});
  await using agent = await Agent.create(failName, askUser, config.url);
  try {
    await agent.process();
    // We shouldn't reach here
    throw new Error("Failed Login should throw")
  }
  catch (e) {
    const isLoginFailure = e instanceof LoginFailedError;
    // We _should_ have a login failure
    if (isLoginFailure) {
      // Go back to the start
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
    if (testFailedLogin) {
      await RunFailedLogin(name, bankConfig);
    }
    // If we have no password, we can't do anything else
    if (bankConfig.password) {
      using logger = new TestSerializer({baseFolder: recordFolder, target: name});
      using askUser = new AskUserConsole(bankConfig);    // We want to write out all API calls and every found element
      await using agent = await Agent.create(name, askUser, bankConfig.url);
      const events = await agent.process();
      logger.logEvents(events);
    }
    else if (!testFailedLogin) {
      // Do not log success if target has not processed anything
      continue;
    }
    successful.push(name);
    // Only update latest on success...
    updateRecordLatest(recordFolder, name);
    if (testFailedLogin) {
      updateRecordLatest(recordFolder, failLoginTarget(name))
    }

  } catch (e) {
    errored.push(name);
  }
}

log.info(`Successful: ${successful.join(", ")}`);
log.info(`Failed: ${errored.join(", ")}`);
