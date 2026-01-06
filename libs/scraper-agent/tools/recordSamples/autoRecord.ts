import { log, LoggerContext } from "@thecointech/logging";
import { installBrowser, maybeCopyProfile, removeBrowser } from "@thecointech/scraper/puppeteer";
import { mkdirSync } from "fs";
import { DateTime } from "luxon";
import path from "path";
import { Agent } from '@/agent';
import { AgentSerializer } from '@/agentSerializer';
import { LoginFailedError } from "@/errors";
import type { IAskUser } from "@/processors/types";
import { type BankConfig, getConfig } from "../config";
import { init } from "../init";
import { AskUserConsole } from './askUserConsole';
import { DummyAskUser } from "./dummyAskUser";
import { updateRecordLatest } from "./updateRecordLatest";

const { baseFolder, config } = getConfig();

const clean = process.argv.includes("--clean");
const refreshBrowserInstall = process.argv.includes("--refresh-browser");
const testFailedLogin = process.argv.includes("--test-fail-login");
const target = process.argv.includes("--target") ? process.argv[process.argv.indexOf("--target") + 1] : undefined;
const except = process.argv.includes("--except") ? process.argv[process.argv.indexOf("--except") + 1] : undefined;

const dateSuffix = DateTime.now().toFormat("yyyy-MM-dd_HH-mm");
const recordFolder = path.join(baseFolder, "archive", dateSuffix);

await init();

if (refreshBrowserInstall) {
  log.info("Removing existing browser install...");
  await removeBrowser();
  log.info("Existing version removed");
}

await installBrowser();
await maybeCopyProfile(clean);

let successful: string[] = [];
let errored: string[] = [];

const failLoginTarget = (name: string) => name + "FailLogin"

// Run the agent, serializing output to recordFolder/name
async function runAgent(name: string, url: string, askUser: IAskUser) {
  const writeDir = path.join(recordFolder, name);
  mkdirSync(writeDir, { recursive: true})
  using serializer = new AgentSerializer({ recordFolder, target: name, writeScreenshotOnElement: true });
  using _ = new LoggerContext({
    level: "trace",
    streams: [{
      path: path.join(writeDir, "events.log"),
      type: "file",
    }]
  });
  await using agent = await Agent.create(name, askUser, url);
  const events = await agent.process();
  serializer.logEvents(events);
}

async function RunFailedLogin(name: string, config: BankConfig) {
  try {
    const askUser = new DummyAskUser(config.bad_credentials);
    await runAgent(failLoginTarget(name), config.url, askUser);
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
  if (name == except) {
    continue;
  }
  // If we have nothing to test continue
  if (!(testFailedLogin || bankConfig.password)) {
    continue;
  }

  try {
    if (testFailedLogin) {
      await RunFailedLogin(name, bankConfig);
      updateRecordLatest(recordFolder, failLoginTarget(name))
    }
    // If we have password, run the full process
    else if (bankConfig.password) {
      using askUser = new AskUserConsole(bankConfig);
      await runAgent(name, bankConfig.url, askUser);
      updateRecordLatest(recordFolder, name);
    }
    successful.push(name);

  } catch (e) {
    log.error(e, `Encountered error in ${name}`);
    errored.push(name);
  }
}

log.info(`Successful: ${successful.join(", ")}`);
log.info(`Failed: ${errored.join(", ")}`);
