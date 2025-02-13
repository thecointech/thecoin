import type { Page } from "puppeteer";
import type { AnyEvent } from "@thecointech/scraper/types";
import { maybeCloseModal } from "./modal";

export async function agentErrorHandler(page: Page, _err: unknown, _event: AnyEvent | null = null) {

  // First, let's see if there is a modal open on the page
  const wasModal = await maybeCloseModal(page);
  if (wasModal) return true;

  // Detect other errors(?)
  return false;
}
