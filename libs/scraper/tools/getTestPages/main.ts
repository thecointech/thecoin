import readline from 'node:readline/promises';
import { Recorder } from '../../src/record';
import { GetIntentApi } from '@thecointech/apis/vqa';
import { LandingWriter } from './landing';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const bankUrl = "https://www.rbcroyalbank.com/personal.html"; //await rl.question('Enter bank URL: ');``

const vqa = GetIntentApi();

const recorder = await Recorder.instance({
  name: "autorecord",
  url: bankUrl,
});
const page = recorder.getPage();

const baseFolder = "/src/testing_pages/unit-tests";

await LandingWriter.process(page, baseFolder, "RBC");


// This should navigate to the bank page
