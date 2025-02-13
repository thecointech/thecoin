import type { Page } from "puppeteer";
import type { AnyEvent } from "@thecointech/scraper/types";
import { maybeCloseModal } from "./modal";

export async function agentErrorHandler(page: Page, _event: AnyEvent, _err: unknown) {

  // First, let's see if there is a modal open on the page
  const wasModal = await maybeCloseModal(page);
  if (wasModal) return true;

  // Detect other errors(?)
  return false;
}
