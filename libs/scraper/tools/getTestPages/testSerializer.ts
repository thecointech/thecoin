import { log } from "@thecointech/logging";
import { mkdirSync, WriteFileOptions, writeFileSync } from "fs";
import path from "path";
import type { Page } from "puppeteer";

export type TestState = {
  // name: string; // Name of the test
  intent?: string;
  page?: string;
}

export type TestElement = {
  name: string;
} & TestState

export type OutputFilePath = {
  baseFolder: string;
  source: string;
  filename: string;
} & TestState

export interface ITestSerializer {
  writeScreenshot(page: Page, state: TestState): Promise<void>;
  writeJson(data: any, test: TestElement): void;
}

// Our data output is in the following format:
// (actually, it's not, but we will move to that)
// intent/  <-- What are we trying to do
//   page/  <-- For each navigation, write out the page
//     source/  <-- The source of the image
//       page.png <-- Every folder has a screenshot
//       page.mhtml
//       intent.json
//       {element-name}.json
//       {element-name}.json
//       ...

export class TestSerializer implements ITestSerializer {

  baseFolder: string

  // The source is constant throughout an execution
  source: string

  constructor(source: string, baseFolder: string) {
    this.baseFolder = baseFolder
    this.source = source
  }

  async writeScreenshot(page: Page, state: TestState, fullPage: boolean = false) {
    // Save screenshot
    const outScFile = this.fromState(state, "png");
    const buffer = await page.screenshot({ type: 'png', fullPage });
    this.write(buffer, outScFile, { encoding: "binary" });

    // Also try for MHTML
    const outMhtml = this.fromState(state, "mhtml");
    const cdp = await page.createCDPSession();
    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    this.write(data, outMhtml);
  }

  writeJson(data: any, test: TestElement) {
    this.write(JSON.stringify(data, null, 2), this.fromElement(test));
  }

  fromState(state: TestState, format: string): OutputFilePath {
    return ({
      baseFolder: this.baseFolder,
      source: this.source,
      ...state,
      filename: `${this.source}.${format}`
    });
  }
  fromElement(test: TestElement): OutputFilePath {
    return ({
      baseFolder: this.baseFolder,
      source: this.source,
      ...test,
      filename: `${this.source}-${test.name}.json`
    });
  }

  write(data: any, out: OutputFilePath, options?: WriteFileOptions) {
    writeFileSync(toPath(out), data, options);
    log.trace(`Wrote: ${toPath(out)}`);
  }
}

function toPath(output: OutputFilePath) {
  const outputFolder = path.join(...[output.baseFolder, output.intent, output.page].filter(x => !!x));
  mkdirSync(outputFolder, { recursive: true });
  // For now, sticking with the old naming scheme
  return path.join(outputFolder, output.filename);
}
