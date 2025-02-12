import { _getImage } from "./getImage";
import { log } from "@thecointech/logging";
import { GetIntentApi } from "@thecointech/apis/vqa";
import { File } from "@web-std/file";
import type { Page } from "puppeteer";

export async function _getPageIntent(page: Page) {
  const image = await _getImage(page);
  const title = await page.title();
  const asFile = new File([image], "screenshot.png", { type: "image/png" });
  const { data: intent } = await GetIntentApi().pageIntent(title, asFile);
  log.trace(`Page detected as type: ${intent.type}`);
  return intent.type;
}
