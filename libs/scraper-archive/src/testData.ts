import { existsSync, readFileSync } from "fs";
import path from "path";
import type { Page } from "puppeteer";
import type { VqaCallData, TestElmData, TestSchData } from "./types";
import type { OverrideData } from "./overrides";
import { log } from "@thecointech/logging";
import open from 'open';
import { getSnapshot, getSnapshots, type SnapshotMeta } from "./snapshots";

export class TestData {
  public readonly key: string;
  public readonly target: string;
  public readonly step: number;
  public readonly matchedFolder: string;
  protected readonly jsonFiles: string[];
  private readonly overrideData: OverrideData;
  private readonly getPage: (url: string) => Promise<Page>;

  constructor(
    key: string,
    target: string,
    step: number,
    matchedFolder: string,
    jsonFiles: string[],
    overrideData: OverrideData,
    getPage: (url: string) => Promise<Page>
  ) {
    this.key = key;
    this.target = target;
    this.step = step;
    this.matchedFolder = matchedFolder;
    this.jsonFiles = jsonFiles;
    this.overrideData = overrideData;
    this.getPage = getPage;
  }

  _page: Page | null = null;
  async page(): Promise<Page> {
    if (this._page) {
      return this._page;
    }
    const filename = `${this.matchedFolder}/${this.step}.mhtml`;
    const url = `file://${filename.replace(" ", "%20")}`;
    this._page = await this.getPage(url);
    return this._page;
  }

  get failing() {
    return this.names().filter(name => !isElementPassing(this, name));
  }

  png(): void {
    const filename = `${this.matchedFolder}/${this.step}.png`;
    if (!existsSync(filename)) {
      log.error(`PNG file not found: ${filename}`);
    }
    else {
      // Fire-and-forget - don't await so it opens immediately
      open(filename)
        .then(proc => proc.unref())
        .catch(err => log.error('Failed to open image:', err));
    }
  }

  elements(): string[] {
    return this.jsonFiles.filter(f => f.endsWith("-elm.json"));
  }
  searches(): string[] {
    return this.jsonFiles.filter(f => f.endsWith("-sch.json"));
  }
  names(): string[] {
    return this.elements().map(f => f.match(/(.+)-elm.json/)?.[1]!);
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

  elm(name: string, withOverride=true): TestElmData | null {
    const element = this.jsonFiles.find(f => f.includes(name) && f.endsWith("-elm.json"));
    if (!element) {
      return null;
    }
    const testName = element.match(/(.+)-elm.json/)?.[1];
    const rawJson: TestElmData = this.json<TestElmData>(element);

    if (withOverride) {
      const elementOverride = this.override(testName!);
      if (elementOverride) {
        if (elementOverride.text) rawJson.data.text = elementOverride.text;
        if (elementOverride.selector) rawJson.data.selector = elementOverride.selector;
      }
    }

    // Clean up spaces in text, older test files did not clean
    // before writing...
    if (rawJson.data.text) {
      rawJson.data.text = rawJson.data.text.replace(/\s+/g, " ").trim();
    }
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
    const rawJson: TestSchData = this.json<TestSchData>(search);
    return rawJson;
  }

  snapshots(name: string, limit: number = 1): SnapshotMeta[] {
    return getSnapshots(this.matchedFolder, name, limit);
  }

  gold(name: string) {
    const testFolder = process.env.PRIVATE_TESTING_PAGES;
    if (!testFolder) {
      throw new Error("PRIVATE_TESTING_PAGES environment variable is not set");
    }
    const goldFile = path.join(testFolder, "gold.json");
    if (existsSync(goldFile)) {
      const json = JSON.parse(readFileSync(goldFile, "utf-8"));
      return json[name];
    }
    return null;
  }

  override(element: string) {
    const overrides = this.overrideData.overrides?.[this.key];
    if (overrides) {
      const elementOverride = overrides[element];
      if (elementOverride) {
        return elementOverride;
      }
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
      step: number,
      matchedFolder: string,
      jsonFiles: string[],
      overrideData: OverrideData,
      getPage: (url: string) => Promise<Page>
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
function isElementPassing(test: TestData, name: string) {
  const elm = test.elm(name);
  const meta = test.snapshots(name)[0];
  if (!meta) {
    return true;
  }
  const snapshot = getSnapshot(meta);
  if (snapshot?.found?.data === undefined) {
    const t2 = getSnapshot(meta);
    console.log("Snapshot not found for", test.key, name, t2);
    return false;
  }
  return (
    elm?.data.text == snapshot.found.data.text &&
    elm?.data.selector == snapshot.found.data.selector
  );
}

