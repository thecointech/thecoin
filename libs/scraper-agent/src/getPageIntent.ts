import { _getImage } from "./getImage";
import { log } from "@thecointech/logging";
import { File } from "@web-std/file";
import type { Page } from "puppeteer";
import { apis } from "./apis";

export async function _getPageIntent(page: Page) {
  const image = await _getImage(page);
  const asFile = new File([image], "screenshot.png", { type: "image/png" });
  const api = await apis().getIntentApi();
  const { data: intent } = await api.pageIntent(asFile);
  log.trace(`Page detected as type: ${intent.type}`);
  return intent.type;
}
