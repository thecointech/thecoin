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
import { Agent } from "../../src/agent";

await init();
const { baseFolder } = getConfig();

const recordFolder = path.join(baseFolder, "record");
mkdirSync(recordFolder, { recursive: true });

const target = process.argv[2] ?? "Target";
using askUser = new AskUserConsole();
const writer = new TestSerializer({ recordFolder, target });
await using agent = await Agent.create(target, askUser);
const page = agent.page;

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
        writer.logJson("intent", {
          intent,
          title: page.title(),
        });
        break;
      }
    case "DumpLinks":
      const allLinks = await page.page.$$eval('a', (links) => links.map((link) => link.innerText));
      writer.logJson("links", allLinks);
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
        writer.logJson("inputs", {
          elements: inputs.map(i => i.data),
          parentCoords,
        });
        writer.logJson("intent", {
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
