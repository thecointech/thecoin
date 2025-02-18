import type { Page } from "puppeteer";
import type { AnyEvent } from "@thecointech/scraper/types";
import { maybeCloseModal } from "./modal";
import { IAgentLogger } from "./types";

export async function agentErrorHandler(page: Page, logger: IAgentLogger|undefined, _err: unknown, _event: AnyEvent | null = null) {

  // First, let's see if there is a modal open on the page
  const wasModal = await maybeCloseModal(page, logger);
  if (wasModal) return true;

  // Detect other errors(?)
  return false;
}
