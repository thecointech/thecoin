import { readFileSync } from "node:fs"
import { type Browser } from "puppeteer"
import { patchOnnxForJest } from "./jestPatch";
import { IsManualRun } from '@thecointech/jestutils';
import { newPage, setRootFolder, setIsVisible } from "../src/puppeteer-init";
import { readdir } from 'node:fs/promises'
import path from "node:path";

export const testFileFolder = process.env.PRIVATE_TESTING_PAGES
export const getTestPage = (...parts: string[]) => `file:///${testFileFolder}/unit-tests/${parts.join('/')}`
export const getTestInfo = (...parts: string[]) => JSON.parse(
  readFileSync(`${testFileFolder}/unit-tests/${parts.join('/')}`, 'utf-8')
)

export const getTestPages = async (...parts: string[]) => {
  const testFolder = `${testFileFolder}/unit-tests/${parts.join('/')}`
  try {
    const files = await readdir(testFolder);
    // Find all mhtml files
    const mhtmlFiles = files.filter(f => f.endsWith('.mhtml'));
    return mhtmlFiles.map(f => {
      const filename = path.basename(f, '.mhtml');
      const jsonFiles = files.filter(jf => jf.startsWith(filename) && jf.endsWith('.json'));
      return {
        name: filename,
        url: getTestPage(...parts, f),
        json: jsonFiles.map(jf => ({
          name: path.basename(jf, '.json').slice(filename.length + 1),
          data: getTestInfo(...parts, jf),
        }))
      }
    });
  }
  catch (e) {
    return [];
  }
}

setIsVisible(async () => IsManualRun);
setRootFolder('./.cache/test');

export function useTestBrowser() {
  let _browser: Browser|null = null;
  beforeAll(async () => {
    patchOnnxForJest();
  })

  afterAll(async () => {
    await _browser?.close();
  })

  const getPage = async () => {
    const { page, browser } = await newPage("default");
    page.setBypassCSP(true);
    _browser = browser;
    return page;
  }
  return { getPage }
}
