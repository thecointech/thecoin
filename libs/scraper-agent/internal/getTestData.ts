import path from "node:path";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { ElementSearchParams, FoundElement } from "@thecointech/scraper";
import { Agent } from "@/agent";
import { DummyAskUser } from "../tools/recordSamples/dummyAskUser";
import { globSync } from "glob";

export type VqaCallData = {
  args: string[],
  response: any,
}
// See matching type
export type TestElmData = FoundElement["data"]
export type TestSchData = {
  score: number,
  components: any,
  search: Omit<ElementSearchParams, "page">
}

export type TestData = {
  key: string,
  agent(): Promise<Agent>;
  target: string,
  step: string,
  vqa: (name: string) => VqaCallData|null,
  elm: (name: string) => TestElmData|null,
  sch: (name: string) => TestSchData|null,
  toString: () => string,
}
export function getTestData(section: string, searchPattern: string, recordTime = 'record-latest') {
  const testFolder = path.join(process.env.PRIVATE_TESTING_PAGES, "unit-tests")
  const baseFolder = path.join(testFolder, recordTime);
  const results: TestData[] = [];
  const pattern = `${baseFolder}/**/${section}/**/*${searchPattern}*`
  const matched = globSync(pattern);
  for (const match of matched) {

    const matchedFolder = path.dirname(match);
    const machedFilename = path.basename(match);
    const key = path.relative(testFolder, matchedFolder)
    if (results.find(r => r.key == key)) {
      continue
    }
    const allPagesAndElements = readdirSync(matchedFolder);
    const step = machedFilename.split('-')[0]
    // If no png/etc move on, we've matched something irrelevant
    if (!existsSync(path.join(matchedFolder, `${step}.png`))) {
      continue;
    }
    const pathBits = matchedFolder.split(path.sep).reverse()
    const target = pathBits[1] == section
      ? pathBits[2]
      : pathBits[1]

    const jsonFiles = allPagesAndElements.filter(f => f.startsWith(step));
    const elmQueryCounters: Record<string, number> = {}
    results.push({
      target,
      key,
      step,
      agent: async () => {
        const filename = `${matchedFolder}/${step}.mhtml`;
        const url = `file://${filename.replace(" ", "%20")}`;
        return Agent.create(target, new DummyAskUser(), url)
      },
      vqa: (call: string) => {
        const f = jsonFiles.find(f => f.includes(call) && f.endsWith("-vqa.json"))
        if (f) {
          return JSON.parse(readFileSync(path.join(matchedFolder, f), "utf-8"))
        }
        return null;
      },
      elm: (name: string) => {
        const counter = elmQueryCounters[name] ?? 0;
        elmQueryCounters[name] = counter + 1;
        const elements = jsonFiles.filter(f => f.includes(name) && f.endsWith("-elm.json"))
        const f = elements[counter]
        if (f) {
          return JSON.parse(readFileSync(path.join(matchedFolder, f), "utf-8"))
        }
        return null;
      },
      sch: (name: string) => {
        // Note: sch is tied to "elm", so we reuse
        // that counter (and don't increment it)
        const counter = elmQueryCounters[name] ?? 0;
        const elements = jsonFiles.filter(f => f.includes(name) && f.endsWith("-sch.json"))
        const f = elements[counter]
        if (f) {
          return JSON.parse(readFileSync(path.join(matchedFolder, f), "utf-8"))
        }
        return null;
      },
      toString: () => key,
    })
  }
  return results;
}
