import { Recorder } from '../../src/record';
import { LandingWriter } from './landing';
import { init } from './init';
import { sleep } from '@thecointech/async';
import { getConfig } from './config';
import { TwoFAWriter } from './twofa';
import { AskUser } from './askUser';
import { AccountSummaryWriter } from './accountSummary';

const { baseFolder, config } = getConfig();
await init(baseFolder)

const name = Object.keys(config)[0]; // Get first config
const recorder = await Recorder.instance({
  name: "autorecord",
  url: config[name].url,
});
// Wait an additional 5 seconds because these pages take _forever_ to load
await sleep(5000);
const page = recorder.getPage();

const askUser = new AskUser();
let nextIntent = await LandingWriter.process(page, name);
if (nextIntent == "TwoFactorAuth") {
  nextIntent = await TwoFAWriter.process(page, name, askUser);
}
// Next intent should be "AccountsSummary"
if (nextIntent != "AccountsSummary") {
  throw new Error("Failed to get to AccountsSummary");
}
nextIntent = await AccountSummaryWriter.process(page, name);

askUser[Symbol.dispose]();
await Recorder.release();

// This should navigate to the bank page
