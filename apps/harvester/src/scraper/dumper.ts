import { DateTime } from "luxon";
import path from "path";
import { logsFolder } from "../paths";
import { mkdirSync, writeFileSync } from "fs";
import { Page } from "puppeteer";
import { log } from "@thecointech/logging";

let dumpFolder: string;
export function initializeDumper(actionName: string) {
  const now = DateTime.now();
  dumpFolder = path.join(logsFolder, "dumps", `${now.toSQLDate()}-${actionName}`, now.toFormat("HH-mm-ss"));
}

export async function dumpPage(page: Page, name="") {
  if (!dumpFolder) {
    return;
  }
  log.debug(`Dumping page to ${dumpFolder}`);

  mkdirSync(dumpFolder, { recursive: true });
  // Save screenshot
  await page.screenshot({ fullPage: true, path: path.join(dumpFolder, `screenshot-${name}.png`) });
  // Save content
  const content = await page.content();
  writeFileSync(path.join(dumpFolder, `content-${name}.html`), content);
  // Lastly, try for MHTML
  const cdp = await page.createCDPSession();
  const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
  writeFileSync(path.join(dumpFolder, `snapshot-${name}.mhtml`), data);
}
