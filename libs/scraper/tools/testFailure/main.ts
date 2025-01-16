import path from "path";
import { getConfig } from "../getTestPages/config";
import { readFileSync } from "node:fs";
import { startPuppeteer } from "../../src/puppeteer-init/init";
import { responseToElement } from "../getTestPages/vqaResponse";
import { init } from "../getTestPages/init";

const { baseFolder } = getConfig();
await init();

const source = "Tangerine";
const testFolder = path.join(baseFolder, "TwoFactorAuth", "initial");
// Test elements
const response = JSON.parse(
  readFileSync(path.join(testFolder, `${source}-vqa-code.json`), "utf-8")
);

const { browser, page } = await startPuppeteer(false);
await page.goto(path.join("file://", testFolder, `${source}.mhtml`));

// const responseElement = accountToElementResponse(response)

const r = await responseToElement(page, response, "INPUT", undefined, 10 * 60 * 1000);
console.log("yay", r);
await browser.close();
