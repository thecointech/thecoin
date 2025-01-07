import readline from 'node:readline/promises';
import { Recorder } from '../scraper/record';
import { GetIntentApi } from '@thecointech/apis/vqa';
import { processLanding } from './landing';
import { getPageIntent } from './intent';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const bankUrl = await rl.question('Enter bank URL: ');``

const vqa = GetIntentApi();

const recorder = await Recorder.instance("chqBalance", bankUrl);
const page = recorder.getPage();

const intent = await getPageIntent(page);

if (intent == "Landing") {
  await processLanding(page);
}

// This should navigate to the bank page
