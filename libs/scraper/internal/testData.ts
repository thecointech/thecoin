import { existsSync, readFileSync } from "fs";
import path from "path";
import { Page } from "puppeteer";
import { FoundElement, ElementSearchParams, ElementData, VqaCallData, TestElmData, TestSchData } from "../src/types";
import { waitPageStable } from "../src/utilities";
import { OverrideData, applyOverrides } from "./overrides";
import { isEqual } from "lodash";

export class TestData {
  public readonly key: string;
  public readonly target: string;
  public readonly step: string;
  public readonly matchedFolder: string;
  protected readonly jsonFiles: string[];
  private readonly overrideData: OverrideData;
  private readonly getPage: () => Promise<Page>;

  constructor(
    key: string,
    target: string,
    step: string,
    matchedFolder: string,
    jsonFiles: string[],
    overrideData: OverrideData,
    getPage: () => Promise<Page>
  ) {
    this.key = key;
    this.target = target;
    this.step = step;
    this.matchedFolder = matchedFolder;
    this.jsonFiles = jsonFiles;
    this.overrideData = overrideData;
    this.getPage = getPage;
  }

  hasSnapshot(): boolean {
    return existsSync(path.join(this.matchedFolder, `${this.step}.mhtml`));
  }

  async page(): Promise<Page> {
    const filename = `${this.matchedFolder}/${this.step}.mhtml`;
    const url = `file://${filename.replace(" ", "%20")}`;
    const page = await this.getPage();
    await page.goto(url);
    await waitPageStable(page);
    return page;
  }

  elements(): string[] {
    return this.jsonFiles.filter(f => f.endsWith("-elm.json"));
  }
  searches(): string[] {
    return this.jsonFiles.filter(f => f.endsWith("-sch.json"));
  }

  private json<T>(file: string): T {
    return JSON.parse(readFileSync(path.join(this.matchedFolder, file), "utf-8"));
  }

  vqa(fnName: string, ...args: any[]): VqaCallData | null {
    const files = this.jsonFiles.filter(f => f.includes(fnName) && f.endsWith("-vqa.json"));
    if (!files.length) {
      return null;
    }
    const cleanArgs = args.filter(arg => !(arg instanceof File));
    // early exit if we only have one file or no args
    if (files.length == 1 || cleanArgs.length == 0) {
      return this.json<VqaCallData>(files[0]);
    }
    const argScore = (callArgs: any[]) => {
      return callArgs.reduce((score, arg, i) => score + scoreArgs(arg, cleanArgs[i]), 0);
    }

    // Some pixel values can vary slightly from the original
    // We assume that one of them matches, so just take the best
    const scored = files.map(f => {
      const call = this.json<VqaCallData>(f);
      return {
        call,
        score: argScore(call.args)
      };
    });
    const best = scored.reduce((best, call) => call.score < best.score ? call : best);
    // Don't allow too much drift...
    if (best.score > 100) {
      throw new Error("Failed to find matching VQA call");
    }
    return best.call;
  }

  *vqa_iter(fnName: string): Generator<VqaCallData, void, unknown> {
    const files = this.jsonFiles.filter(f => f.includes(fnName) && f.endsWith("-vqa.json"));
    for (const file of files) {
      yield this.json<VqaCallData>(file);
    }
  }

  elm(name: string): TestElmData | null {
    const element = this.jsonFiles.find(f => f.includes(name) && f.endsWith("-elm.json"));
    if (!element) {
      return null;
    }
    const testName = element.match(/(.+)-elm.json/)?.[1];
    const rawJson: TestElmData = JSON.parse(readFileSync(path.join(this.matchedFolder, element), "utf-8"));
    applyOverrides(this.overrideData, this.key, testName!, rawJson);
    return rawJson;
  }

  *elm_iter(fnName: string): Generator<TestElmData, void, unknown> {
    const files = this.jsonFiles.filter(f => f.includes(fnName) && f.endsWith("-elm.json"));
    for (const file of files) {
      yield this.json<TestElmData>(file);
    }
  }

  sch(name: string): TestSchData | null {
    const search = this.jsonFiles.find(f => f.includes(name) && f.endsWith("-sch.json"));
    if (!search) {
      return null;
    }
    const rawJson: TestSchData = JSON.parse(readFileSync(path.join(this.matchedFolder, search), "utf-8"));
    return rawJson;
  }

  gold(name: string) {
    const testFolder = process.env.PRIVATE_TESTING_PAGES!;
    const goldFile = path.join(testFolder, "gold.json");
    if (existsSync(goldFile)) {
      const json = JSON.parse(readFileSync(goldFile, "utf-8"));
      return json[name];
    }
    return null;
  }

  toString(): string {
    return this.key;
  }

  // Factory method to create new instances with the same parameters
  // Useful for creating subclass instances from existing TestData
  createInstance<T extends TestData>(
    constructor: new (
      key: string,
      target: string,
      step: string,
      matchedFolder: string,
      jsonFiles: string[],
      overrideData: OverrideData,
      getPage: () => Promise<Page>
    ) => T
  ): T {
    return new constructor(
      this.key,
      this.target,
      this.step,
      this.matchedFolder,
      this.jsonFiles,
      this.overrideData,
      this.getPage
    );
  }
}

function scoreArgs(arg: any, clean: any) {
  if (arg === clean) return 0;

  switch(typeof arg) {
    case "string":
      // Allow white-space to be trimmed, but this must match
      return arg.trim() == clean.trim() ? 0 : Infinity;
    case "number":
      // Allow numbers to vary slightly, as the cached
      // page can differ from the original slightly
      return Math.abs(Number(arg) - Number(clean));
    default:
      // All other types are not allowed to be different
      return Infinity;
  }
}
