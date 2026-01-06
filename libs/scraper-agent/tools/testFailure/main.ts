import path from "path";
import { getConfig } from "../config";
import { readFileSync } from "node:fs";
import { responseToElement } from "../../src/vqaResponse";
import { init } from "../init";
import { _getImageFile } from "../../src/getImage";
import { newPage } from "@thecointech/scraper/puppeteer";

const { baseFolder } = getConfig();
await init();

const target = process.argv[2] ?? "Target";
const section = process.argv[3] ?? "Section";

const { browser, page } = await newPage();
const basePath = `${baseFolder}/latest/${target}/${section}`;
const baseUrl = path.join("file://", basePath.replace(" ", "%20"));
const pageUrl = path.join(baseUrl, "1.mhtml");
await page.goto(pageUrl);

const vqaResponse = readFileSync(path.join(basePath, "1-select-recipient-vqa.json"), "ascii");
const element = await responseToElement({
  page,
  response: JSON.parse(vqaResponse),
  hints: { eventName: "testing", role: "option" }
});
// const image = await _getImage(page, true, path.join(testFolder, `resized-page.png`));
// const api = GetETransferApi();
// const { data: nextButton } = await api.detectNextButton(image);
// if (!nextButton) {
//   throw new Error("Next button not found");
// }
console.log("element", element);
await browser.close();
