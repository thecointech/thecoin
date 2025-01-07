import { GetIntentApi } from "@thecointech/apis/vqa";
import { getScreenshotFile } from "./screenshot";
import type { Page } from "puppeteer";

export async function getPageIntent(page: Page) {
  const scf = await getScreenshotFile(page);
  const { data: intent } = await GetIntentApi().pageIntent(scf);

  return intent.type;
}
