import { Recorder, Registry } from "@thecointech/scraper/record";
import { AskUser } from "../../src/askUser";
import { init } from "../../src/init";
import { getConfig } from "../../src/config";
import { TestSerializer, TestState } from "../../src/testSerializer";
import { _getPageIntent } from "../../src/testPageWriter.js";
import { getCoordsWithMargin, mapInputToParent } from "./highlighter";
import { getAllElements } from "@thecointech/scraper/elements";
import { mkdirSync } from "fs";
import path from "path";

await init();
const { baseFolder } = getConfig();

const recordFolder = path.join(baseFolder, "record");
mkdirSync(recordFolder, { recursive: true });

const target = process.argv[2] ?? "Target";
const testState: TestState = {
  intent: "samples",
  page: target
}

using askUser = new AskUser();
// await using recorder = await Registry.create({ name: "testing" });
let numScreenshots = 1;
const writer = new TestSerializer(numScreenshots.toString(), recordFolder);

const page = recorder.page;
const newSC = async (hint: string) => {
  writer.source = (numScreenshots++).toString() + (hint ? `-${hint}` : "");
  await writer.writeScreenshot(page, testState, true);
}
const writeJson = async (data: any, name: string) => {
  writer.writeJson(data, { ...testState, name });
}

let recordMore = true;
while (recordMore) {
  const choice = await askUser.selectOption("Select Choice (q to quit): ", {
    "Screenshot": [{ "cont": "Screenshot" }],
    "Dump Links": [{ "cont": "DumpLinks" }],
    "Highlight Inputs": [{ "cont": "HighlightInputs" }],
    "Quit": [{ "cont": "Quit" }],
  }, "cont");
  let delay = 0;

  switch (choice.cont) {
    case "Screenshot":
      await newSC('page');
      const intent = await _getPageIntent(page);
      // Save out the inferred intent when loading the page
      // (This may be different from the stated intent)
      writeJson({
        intent,
        title: page.title(),
      }, "intent");
      break;
    case "DumpLinks":
      const allLinks = await page.$$eval('a', (links) => links.map((link) => link.innerText));
      writeJson(allLinks, "links");
      break;
    case "HighlightInputs":
      // await page.evaluate(initElementHighlight);
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));

      const inputs = await getAllElements(page, Number.MAX_SAFE_INTEGER, 'input, select, [role="combobox"], [aria-haspopup="listbox"]');
      const parents = await Promise.all(inputs.map(i => page.evaluateHandle(mapInputToParent, i.element)));
      // const parentData = await page.evaluate(getCoordsWithMargin, ...parents);
      const parentCoords = await Promise.all(parents.map(p => page.evaluate(getCoordsWithMargin, p)));
      await newSC('page');
      writeJson({
        elements: inputs.map(i => i.data),
        parentCoords,
      }, "inputs");
      writeJson({
        title: await page.title(),
        intent: await _getPageIntent(page),
      }, "intent");

      break;
    case "Quit":
      recordMore = false;
      break;
  }
}
console.log("All Done");
