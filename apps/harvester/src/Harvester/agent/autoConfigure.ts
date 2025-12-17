import { type SectionName, type EventSection, Agent, ProcessResults } from '@thecointech/scraper-agent';
import { log } from "@thecointech/logging";
import { type BackgroundTaskCallback } from "@/BackgroundTask/types";
import { setEvents } from '../events';
import { downloadRequired } from '@/GetStarted/download';
import type { BankConfig, BankType } from '@thecointech/store-harvester';
import { sections } from '@thecointech/scraper-agent/processors/types';
import { VisibleOverride } from '@thecointech/scraper/puppeteer-init/visibility';
import { AskUserLogin } from './askUserLogin';
import { getErrorMessage } from '@/BackgroundTask';
import { AgentCallbacks } from './agentCallbacks';

export type AutoConfigParams = {
  type: BankType;
  config: BankConfig;
  visible: boolean;
}

export async function autoConfigure({ type, config, visible }: AutoConfigParams, depositAddress: string, callback: BackgroundTaskCallback) {

  log.info(`Agent: Starting configuration for action: autoConfigure`);

  // This should do nothing, but call it anyway
  await downloadRequired(callback);

  const { username, password, name, url } = config;
  if (!username || !password) throw new Error("Username and password are required");

  // Create the logger quickly, as that triggers the background task/loading screen
  const toSkip = getSectionsToSkip(type);
  const toProcess = sections.filter(s => !toSkip.includes(s));
  await using logger = await AgentCallbacks.create({
    taskType: "record",
    uiCallback: callback,
    sections: toProcess,
    target: `${name}-runAgent`,
  });

  using inputBridge = AskUserLogin.newLoginSession({
    username,
    password,
  }, depositAddress);

  try {
    using _ = new VisibleOverride(visible)
    await using agent = await Agent.create(name, inputBridge, url, logger);
    const results = await agent.process(toSkip);

    // Ensure we have required info
    throwIfAnyMissing(results.events, type);

    await storeEvents(type, config, results);

    logger.complete({ result: JSON.stringify(results.accounts) });

    log.info(`Agent: Finished configuring for action: ${name}`);
  }
  catch (e: any) {
    const msg = getErrorMessage(e);
    log.error(e, `Error configuring agent for action: ${name}`);
    logger.complete({ error: msg });
    throw e;
  }

  // find all the sections we want to keep, and flatten them
  return true;
}

async function storeEvents(type: BankType, config: BankConfig, results: ProcessResults) {
  await setEvents(type, {
    ...config,
    ...results,
  });
}

function getSectionsToSkip(type: BankType) : SectionName[] {
  const sectionsToSkip: SectionName[] = [];
  switch (type) {
    case "chequing":
      sectionsToSkip.push("CreditAccountDetails");
      break;
    case "credit":
      sectionsToSkip.push("SendETransfer");
      break;
    case "both":
      // Don't skip anything
      break;
  }
  return sectionsToSkip;
}

function throwIfAnyMissing(baseNode: EventSection, type: BankType) {
  if (type != 'credit') {
    if (!baseNode.events.find(s => (s as EventSection).section == 'SendETransfer')) {
      const foundSections = baseNode.events
        .map(s => (s as EventSection).section)
        .filter(s => !!s);
      log.info(`Agent: ${type} expected to find SendETransfer, but only found the following sections: ${foundSections.join(', ')}`);
      throw new Error("SendETransfer not configured");
    }
  }
  if (type != 'chequing') {
    if (!baseNode.events.find(s => (s as EventSection).section == 'CreditAccountDetails')) {
      const foundSections = baseNode.events
        .map(s => (s as EventSection).section)
        .filter(s => !!s);
      log.info(`Agent: ${type} expected to find CreditAccountDetails, but only found the following sections: ${foundSections.join(', ')}`);
      throw new Error("CreditAccountDetails not configured");
    }
  }
}
