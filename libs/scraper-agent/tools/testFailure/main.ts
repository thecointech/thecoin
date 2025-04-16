import path from "path";
import { getConfig } from "../getTestPages/config";
import { readFileSync } from "node:fs";
import { newPage } from "../../src/puppeteer-init/init";
import { responseToElement } from "../getTestPages/vqaResponse";
import { init } from "../getTestPages/init";
import { GetAccountSummaryApi, GetETransferApi } from "@thecointech/apis/vqa";
import { File } from "@web-std/file";
import { updateAccountNumber } from "../getTestPages/accountSummary";
import { getAllElements } from "../../src/elements";
import { getCoordsWithMargin, mapInputToParent } from "../recordSamples/highlighter";
import { _getImage } from "../getTestPages/testPageWriter";
import type { BBox } from "@thecointech/vqa";

const { baseFolder } = getConfig();
await init();

const target = process.argv[2] ?? "Target";

const testFolder = path.join(baseFolder, "samples", "etransfer", target);

const { browser, page } = await newPage(false);
await page.goto(path.join("file://", testFolder, `4-page.mhtml`));

const image = await _getImage(page, true, path.join(testFolder, `resized-page.png`));
const api = GetETransferApi();
const { data: nextButton } = await api.detectNextButton(image);
if (!nextButton) {
  throw new Error("Next button not found");
}

await browser.close();
