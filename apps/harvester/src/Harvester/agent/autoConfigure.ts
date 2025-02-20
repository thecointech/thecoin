import { Agent, SectionName, EventSection } from '@thecointech/scraper-agent';
import { ScraperCallbacks } from "../scraper/callbacks";
import { AskUserReact } from "./askUser";
import { log } from "@thecointech/logging";
import type { BackgroundTaskCallback } from "@/BackgroundTask/types";
import { initAgent } from "./init";
import { setEvents } from '../events';
import { BankTypes } from '../scraper';
import { stripDuplicateNavigationsSection } from './stripDuplicateEvents';
import { sleep } from '@thecointech/async';

export type AutoConfigParams = {
  type: BankTypes;
  name: string;
  url: string;
  username: string;
  password: string;
}

export async function autoConfigure({ type, name, url, username, password }: AutoConfigParams, depositAddress: string, callback: BackgroundTaskCallback) {

  log.info(`Agent: Starting configuration for action: autoConfigure`);
  // This should do nothing, but call it anyway
  await initAgent(callback);

  if (!username || !password) throw new Error("Username and password are required");

  const inputBridge = AskUserReact.newSession(depositAddress);
  inputBridge.setUsername(username);
  inputBridge.setPassword(password);

  const toSkip = getSectionsToSkip(type);
  const logger = new ScraperCallbacks(name, callback);

  try {
    // Initialize at 0
    logger.onProgress({ step: 0, stepPercent: 0, total: 7 });
    // const baseNode = await Agent.process(name, url, inputBridge, logger, toSkip);

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 10; j++) {
        await sleep(3 * 1000);
        logger.onProgress({ step: i, stepPercent: (j * 100), total: 7 });
      }
    }
    // Ensure we have required info
    // throwIfAnyMissing(baseNode, type);

    // await storeEvents(type, baseNode);
    await sleep(30 * 1000);

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

async function storeEvents(type: BankTypes, baseNode: EventSection) {
  // const sectionsToKeep = getSectionsToKeep(type);
  // const events = flatten(baseNode, sectionsToKeep);
  const strippedNode = stripDuplicateNavigationsSection(baseNode);
  await setEvents(type, strippedNode);
}

function getSectionsToSkip(type: BankTypes) : SectionName[] {
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

function throwIfAnyMissing(baseNode: EventSection, type: BankTypes) {
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
