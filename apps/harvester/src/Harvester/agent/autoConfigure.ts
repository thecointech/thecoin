import { SectionName, EventSection, Agent } from '@thecointech/scraper-agent';
import { ScraperCallbacks } from "../scraper/callbacks";
import { AskUserReact } from "./askUser";
import { log } from "@thecointech/logging";
import { type BackgroundTaskCallback } from "@/BackgroundTask/types";
import { setEvents } from '../events';
import { stripDuplicateNavigationsSection } from './stripDuplicateEvents';
import { downloadRequired } from '@/Download/download';
import { BankType } from '../scraper';
import { sections } from '@thecointech/scraper-agent/processors/types';

export type AutoConfigParams = {
  type: BankType;
  name: string;
  url: string;
  username: string;
  password: string;
  visible: boolean;
}

export async function autoConfigure({ type, name, url, username, password, visible }: AutoConfigParams, depositAddress: string, callback: BackgroundTaskCallback) {

  log.info(`Agent: Starting configuration for action: autoConfigure`);
  // This should do nothing, but call it anyway
  await downloadRequired(callback);

  if (!username || !password) throw new Error("Username and password are required");

  const inputBridge = AskUserReact.newSession(depositAddress);
  inputBridge.setUsername(username);
  inputBridge.setPassword(password);

  const toSkip = getSectionsToSkip(type);
  const toProcess = sections.filter(s => !toSkip.includes(s));
  const logger = new ScraperCallbacks("record", callback, toProcess);

  try {
    const oldHeadless = process.env.RUN_SCRAPER_HEADLESS;
    process.env.RUN_SCRAPER_HEADLESS = visible ? "false" : "true";
    const baseNode = await Agent.process(name, url, inputBridge, logger, toSkip);
    process.env.RUN_SCRAPER_HEADLESS = oldHeadless;

    // Ensure we have required info
    throwIfAnyMissing(baseNode, type);

    await storeEvents(type, baseNode);

    logger.complete(true);

    log.info(`Agent: Finished configuring for action: ${name}`);
  }
  catch (e) {
    log.error(e, `Error configuring agent for action: ${name}`);
    const msg = e instanceof Error ? e.message : String(e);
    logger.complete(false, msg);
    throw e;
  }

  // find all the sections we want to keep, and flatten them
  return true;
}

async function storeEvents(type: BankType, baseNode: EventSection) {
  // const sectionsToKeep = getSectionsToKeep(type);
  // const events = flatten(baseNode, sectionsToKeep);
  const strippedNode = stripDuplicateNavigationsSection(baseNode);
  await setEvents(type, strippedNode);
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
