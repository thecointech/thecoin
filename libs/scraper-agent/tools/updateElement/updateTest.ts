import { TestSerializer } from "../recordSamples/testSerializer";
import path from "path";
import { getConfig } from "../config";
import { newPage } from "@thecointech/scraper/puppeteer";
import { init } from "../init";
import { PageHandler } from "../../src/pageHandler";
// import { selectDestination } from "../../src/processors/twofa";
import { DummyAskUser } from "../recordSamples/dummyAskUser";
import { TwofaApi } from "@thecointech/vqa";
import { readFileSync } from "fs";

const target = process.argv[2];
const section = process.argv[3];

await init();
const { baseFolder } = getConfig();
const recordFolder = path.join(baseFolder, "record-latest");
const logger = new TestSerializer({baseFolder: recordFolder, target, skipSections: []});

const basePath = `${recordFolder}/${target}/${section}`;
const baseUrl = path.join("file://", basePath.replace(" ", "%20"));
const pageUrl = path.join(baseUrl, "0.mhtml");

const handler = await PageHandler.create(target, pageUrl, logger);
handler.pushSection("TwoFA")
const askUser = new DummyAskUser();

const vqaDetectDestinations = JSON.parse(readFileSync(path.join(basePath, "0-destinations-vqa.json"), "ascii"));
const vqaGetDestinationElements = JSON.parse(readFileSync(path.join(basePath, "0-destinations-elm.json"), "ascii"));

let counter = 0;
const mockApi = {
  detectDestinations: () => ({ data: vqaDetectDestinations }),
  getDestinationElements: () => ({ data: { buttons: vqaGetDestinationElements[counter++].options } }),
}
// await selectDestination(handler, askUser, mockApi as any);
