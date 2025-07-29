import { _getImage } from "./getImage";
import { log } from "@thecointech/logging";
import { GetIntentApi } from "@thecointech/apis/vqa";
import { File } from "@web-std/file";
import type { Page } from "puppeteer";

export async function _getPageIntent(page: Page) {
  const image = await _getImage(page);
  const asFile = new File([image], "screenshot.png", { type: "image/png" });
  const api = await GetIntentApi();
  const { data: intent } = await api.pageIntent(asFile);
  log.trace(`Page detected as type: ${intent.type}`);
  return intent.type;
}
