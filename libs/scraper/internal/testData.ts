import { existsSync, readFileSync } from "fs";
import path from "path";
import { Page } from "puppeteer";
import { FoundElement, ElementSearchParams, ElementData } from "../src/types";
import { waitPageStable } from "../src/utilities";
import { OverrideData, applyOverrides } from "./overrides";
import { isEqual } from "lodash";

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
    const argsEqual = (callArgs: any[]) => {
      return callArgs.every((arg, i) => arg === cleanArgs[i]);
    }
    for (const f of files) {
      const call = this.json<VqaCallData>(f);
      if (call.args && argsEqual(call.args)) {
        return call;
      }
    }
    return null;
  }

  elm(name: string, index = 0): TestElmData | null {
    const elements = this.jsonFiles.filter(f => f.includes(name) && f.endsWith("-elm.json"));
    if (!elements) {
      return null;
    }
    if (elements.length <= index) {
      return null;
    }
    const element = elements[index];
    const rawJson: TestElmData = JSON.parse(readFileSync(path.join(this.matchedFolder, element), "utf-8"));
    applyOverrides(this.overrideData, this.key, name, index, rawJson);
    return rawJson;
  }

  sch(name: string, index = 0): TestSchData | null {
    const searches = this.jsonFiles.filter(f => f.includes(name) && f.endsWith("-sch.json"));
    if (!searches) {
      return null;
    }
    if (searches.length <= index) {
      return null;
    }
    const search = searches[index];
    const rawJson: TestSchData = JSON.parse(readFileSync(path.join(this.matchedFolder, search), "utf-8"));
    return rawJson;
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
