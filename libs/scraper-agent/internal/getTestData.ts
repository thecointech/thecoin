import path from "node:path";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { ElementSearchParams, FoundElement } from "@thecointech/scraper";

export type VqaCallData = {
  args: string[],
  response: any,
}
// See matching type
export type TestElmData = Omit<FoundElement, "element"> & {
  search: Omit<ElementSearchParams, "page">
}

export type TestData = {
  target: string,
  page: string,
  html: string|null,
  vqa: (name: string) => VqaCallData|null
  elm: (name: string) => TestElmData|null
}
export function getTestData(section: string, searchPattern: string) {
  const latestFolder = path.join(process.env.PRIVATE_TESTING_PAGES, "unit-tests", "record-latest");
  const targets = readdirSync(latestFolder)
  const results: TestData[] = [];
  for (const target of targets) {
    const targetSection = path.join(latestFolder, target, section);
    if (!existsSync(targetSection))
      continue;

    const allPagesAndElements = readdirSync(targetSection);
    // find the thingy most wot looks searchy
    const testItem = allPagesAndElements.find(f => f.includes(searchPattern))
    // What's the page of this element?
    const page = testItem.split('-')[0]
    const jsonFiles = allPagesAndElements.filter(f => f.startsWith(page));
    const elmQueryCounters: Record<string, number> = {}
    results.push({
      target,
      page: `${page}.png`,
      html: existsSync(`${page}.mhtml`) ? `${page}.mhtml` : null,
      vqa: (call: string) => {
        const f = jsonFiles.find(f => f.includes(call) && f.endsWith("-vqa.json"))
        if (f) {
          return JSON.parse(readFileSync(path.join(targetSection, f), "utf-8"))
        }
        return null;
      },
      elm: (name: string) => {
        const counter = elmQueryCounters[name] ?? 0;
        elmQueryCounters[name] = counter + 1;
        const elements = jsonFiles.filter(f => f.includes(name) && f.endsWith("-elm.json"))
        const f = elements[counter]
        if (f) {
          return JSON.parse(readFileSync(path.join(targetSection, f), "utf-8"))
        }
        return null;
      }
    })
  }
  return results;
}
