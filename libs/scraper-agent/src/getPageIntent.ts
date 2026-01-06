import { _getImageFile } from "./getImage";
import { log } from "@thecointech/logging";
import type { Page } from "puppeteer";
import { apis } from "./apis";

export async function _getPageIntent(page: Page) {
  const image = await _getImageFile(page);
  const api = await apis().getIntentApi();
  const { data: intent } = await api.pageIntent(image);
  log.trace(`Page detected as type: ${intent.type}`);
  return intent.type;
}
