import { Agent, SectionName, EventSection, ProgressInfo } from '@thecointech/scraper-agent';
import { AgentLogger } from "./agentLogger";
import { AskUserReact } from "./askUser";
import { log } from "@thecointech/logging";
import type { BackgroundTaskCallback } from "@/BackgroundTask/types";
import { initAgent } from "./init";
import { setEvents } from '../events';
import { BankTypes } from '../scraper';
import { stripDuplicateNavigationsSection } from './stripDuplicateEvents';

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
  const onProgress = (progress: ProgressInfo) => {
    const totalPercent = progress.sectionPercent + (progress.section * 100) / progress.totalSections;
    callback({
      taskId: "agent",
      stepId: name,
      progress: totalPercent,
      label: `Step ${progress.section + 1} of ${progress.totalSections}`
    })
  }

  try {
    const baseNode = await Agent.process(name, url, inputBridge, AgentLogger.instance, onProgress, toSkip);

    await storeEvents(type, baseNode);

    callback({
      taskId: "agent",
      stepId: name,
      progress: 100,
      completed: true
    })

    log.info(`Agent: Finished configuring for action: ${name}`);
  }
  catch (e) {
    log.error(e, `Error configuring agent for action: ${name}`);
    const msg = e instanceof Error ? e.message : String(e);
    callback({
      taskId: "agent",
      stepId: name,
      completed: false,
      error: msg
    })
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
