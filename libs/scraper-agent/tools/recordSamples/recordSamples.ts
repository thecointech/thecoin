import { Recorder, Registry } from "@thecointech/scraper/record";
import { init } from "../init";
import { getConfig } from "../config";
import { TestSerializer } from "./testSerializer";
import { getAllElements } from "@thecointech/scraper/elements";
import { mkdirSync } from "fs";
import path from "path";
import { AskUserConsole } from "./askUserConsole";
import { PageHandler } from "../../src/pageHandler";
import { getCoordsWithMargin, mapInputToParent } from "../../src/elementUtils";

await init();
const { baseFolder } = getConfig();

const recordFolder = path.join(baseFolder, "record");
mkdirSync(recordFolder, { recursive: true });

const target = process.argv[2] ?? "Target";
using askUser = new AskUserConsole();

let numScreenshots = 1;
const writer = new TestSerializer({ baseFolder, target });

await using page = await PageHandler.create(target, "", writer);
// const newSC = async (hint: string) => {
//   writer.source = (numScreenshots++).toString() + (hint ? `-${hint}` : "");
//   await writer.writeScreenshot(page, testState, true);
// }
// const writeJson = async (data: any, name: string) => {
//   writer.writeJson(data, { ...testState, name });
// }

let recordMore = true;
while (recordMore) {
  const choice = await askUser.selectOption("Select Choice (q to quit): ", [
    {
      name: "Screenshot",
      options: ["Screenshot" ]
    },
    {
      name: "Dump Links",
      options: ["DumpLinks" ]
    },
    {
      name: "Highlight Inputs",
      options: ["HighlightInputs" ]
    },
    {
      name: "Quit",
      options: ["Quit" ]
    }
  ]
  );
  let delay = 0;

  switch (choice.name) {
    case "Screenshot":
      {
        const intent = await page.getPageIntent();
        // Save out the inferred intent when loading the page
        // (This may be different from the stated intent)
        writer.logJson(undefined, "intent", {
          intent,
          title: page.title(),
        });
        break;
      }
    case "DumpLinks":
      const allLinks = await page.page.$$eval('a', (links) => links.map((link) => link.innerText));
      writer.logJson(undefined, "links", allLinks);
      break;
    case "HighlightInputs":
      {
        // await page.evaluate(initElementHighlight);
        if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));

        const inputs = await getAllElements(page.page, Number.MAX_SAFE_INTEGER, 'input, select, [role="combobox"], [aria-haspopup="listbox"]');
        const parents = await Promise.all(inputs.map(i => page.page.evaluateHandle(mapInputToParent, i.element)));
        // const parentData = await page.evaluate(getCoordsWithMargin, ...parents);
        const parentCoords = await Promise.all(parents.map(p => page.page.evaluate(getCoordsWithMargin, p)));
        const intent = await page.getPageIntent();
        writer.logJson("sample", "inputs", {
          elements: inputs.map(i => i.data),
          parentCoords,
        });
        writer.logJson("sample", "intent", {
          title: await page.title(),
          intent,
        });

        break;
      }
    case "Quit":
      recordMore = false;
      break;
  }
}
console.log("All Done");
