import { Page } from "puppeteer";
import { File } from '@web-std/file';
import path from "path";
import { logsFolder } from "../paths";
import { DateTime } from "luxon";
import { mkdirSync } from "fs";

let counter = 0;

const now = DateTime.now();
const dumpFolder = path.join(logsFolder, "dumps", `${now.toSQLDate()}`, now.toFormat("HH-mm-ss"));

export async function getScreenshotFile(page: Page) {
  mkdirSync(dumpFolder, { recursive: true });
  const scpath = path.join(dumpFolder, `screenshot-${counter++}.png`);
  const screenshot = await page.screenshot({ type: 'png', path: scpath });
  // Create a simple object that matches what the API expects
  return new File([screenshot], "screenshot.png", { type: "image/png" });
}
