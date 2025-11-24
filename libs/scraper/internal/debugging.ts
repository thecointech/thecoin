import type { Page } from "puppeteer";
import path from "path";
import fs from "fs";
import { rootFolder } from "../src/puppeteer-init/rootFolder";

export function initDebuggingInfo(page: Page) {
  const dbgFile = path.join(rootFolder(), 'puppeteer-debug.log');
  // Open file with append
  const stream = fs.createWriteStream(dbgFile, { flags: 'a' });
  page.on('request', request => {
    // console.log('PAGE Request:', request.url(), request.headers());
    stream.write(`PAGE Request: ${request.url()} ${JSON.stringify(request.headers())}\n`);
  });
  page.on('response', response => {
    // console.log('PAGE Response:', response.url(), response.status());
    stream.write(`PAGE Response: ${response.url()} ${response.status()}\n`);
    const url = response.url();
    if (url.includes('omni.royalbank.com') || url.includes('www1.royalbank.com')) {
      stream.write(`Response from ${url} (${response.status()})\nHeaders: ${JSON.stringify(response.headers(), null, 2)}\n`);
    }
  });
  page.on('console', msg => {
    const text = msg.text();
    // console.log('PAGE Console:', msg.text())
    stream.write(`PAGE Console: ${text}\n`);
    if (msg.type() === 'error' ||
      text.includes('CORS') ||
      text.includes('Access-Control-Allow-Origin') ||
      text.includes('blocked by CORS policy')
    ) {
      console.log(`PAGE Console: ${text}\n`);
    }
  });
  page.on('framenavigated', frame => {
    // console.log('PAGE FrameNavigation to:', frame.url());
    stream.write(`PAGE FrameNavigation to: ${frame.url()}\n`);
  });
}
