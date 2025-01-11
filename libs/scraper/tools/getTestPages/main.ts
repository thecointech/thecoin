import { Recorder } from '../../src/record';
import { LandingWriter } from './landing';
import { init } from './init';
import { sleep } from '@thecointech/async';
import { getConfig } from './config';
import { TwoFAWriter } from './twofa';
import { AskUser } from './askUser';
import { AccountSummaryWriter } from './accountSummary';
import { LoginWriter } from './login';
import { PageType } from '@thecointech/vqa';
import { AccountDetailsWriter } from './accountDetails';

const { baseFolder, config } = getConfig();
await init(baseFolder)
const askUser = new AskUser();
type PageIntentAug = PageType | "TwoFactorAuth";

try {
  const name = "TD" //Object.keys(config)[1]; // Get first config
  const recorder = await Recorder.instance({
    name: "autorecord",
    url: config[name].url,
    headless: false
  });
  // Wait an additional 5 seconds because these pages take _forever_ to load
  await sleep(5000);
  const page = recorder.getPage();

  let nextIntent: PageIntentAug = await LandingWriter.process(page, name);
  if (nextIntent != "Login") {
    throw new Error("Failed to get to Login");
  }
  nextIntent = await LoginWriter.process(page, name, config[name]);

  if (nextIntent == "TwoFactorAuth") {
    nextIntent = await TwoFAWriter.process(page, name, askUser);
  }
  // Next intent should be "AccountsSummary"
  if (nextIntent != "AccountsSummary") {
    throw new Error("Failed to get to AccountsSummary");
  }

  const accounts = await AccountSummaryWriter.process(page, name);
  for (const account of accounts) {
    if (account.account_type == "Credit") {
      // NOTE! This means we can only support 1 credit account at a time
      // (Which is fine for the use case)
      const details = await AccountDetailsWriter.process(page, name, account);

    }
  }

} finally {
  askUser[Symbol.dispose]();
  await Recorder.release();
}

