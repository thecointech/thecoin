import { Recorder } from '../../src/record';
import { LandingWriter } from './landing';
import { init } from './init';
import { getConfig } from './config';
import { TwoFAWriter } from './twofa';
import { AskUser } from './askUser';
import { AccountSummaryWriter } from './accountSummary';
import { LoginWriter } from './login';
import { AccountDetailsWriter } from './accountDetails';
import { PageIntentAug } from './types';
import { TestSerializer } from './testSerializer';
import { log } from '@thecointech/logging';
import { _getPageIntent } from './testPageWriter';
import { mkdirSync } from 'fs';
import { DateTime } from 'luxon';
import { DummyAskUser } from './dummyAskUser';
import { triggerNavigateAndWait } from './vqaResponse';

const { baseFolder, config } = getConfig();
await init()

let successful = [];
let errored = [];

for (const [name, bankConfig] of Object.entries(config)) {

  log.info(`Processing ${name}`);

  const recorder = await Recorder.instance({
    name: "autorecord",
    url: bankConfig.url,
    headless: false
  });
  const askUser = new AskUser(bankConfig);

  try {
    // Wait an additional 5 seconds because these pages take _forever_ to load

    const page = recorder.getPage();

    // CIBC/BMO somehow seem to fail when opening the first time
    await triggerNavigateAndWait(page, () => page.reload({ waitUntil: "networkidle2" }));

    const testConfig = {
      recorder,
      writer: new TestSerializer(name, baseFolder),
      askUser: askUser
    }

    let nextIntent: PageIntentAug = await LandingWriter.process(testConfig);
    if (nextIntent != "Login") {
      throw new Error("Failed to get to Login");
    }

    // First, test a failed login
    const loginUrl = page.url();
    let loginOutcome = await LoginWriter.process({
      ...testConfig,
      askUser: new DummyAskUser(bankConfig.bad_credentials)
    });
    if (loginOutcome != "LoginError") {
      throw new Error("Failed to get to LoginError");
    }
    if (!bankConfig.username || !bankConfig.password) {
      // We don't have details, so we're done.
      continue;
    }

    // Next, test a successful login
    await triggerNavigateAndWait(page, () => page.goto(loginUrl, { waitUntil: "networkidle2" }));
    loginOutcome = await LoginWriter.process({
      ...testConfig,
      writer: new TestSerializer(name, baseFolder + "login-retry"),
    });
    switch(loginOutcome) {
      case "LoginError":
        // That's fine, we don't have the details.
        continue;
      case "TwoFactorAuth":
        nextIntent = await TwoFAWriter.process(testConfig);
        break;
      default:
        nextIntent = await _getPageIntent(page);
    }

    // Next intent should be "AccountsSummary"
    if (nextIntent != "AccountsSummary") {
      const choice = await askUser.selectOption(`Expected to be on AccountsSummary, got ${nextIntent}. Should we continue?`, {
        "Skip": [{ "cont": "Skip" }],
        "Continue": [{ "cont": "Ignore" }],
        "Throw": [{ "cont": "Throw" }]
      }, "cont");
      switch (choice.cont) {
        case "Skip":
          continue;
        case "Throw":
          throw new Error("Failed to get to AccountsSummary");
      }
    }

    const summary = await AccountSummaryWriter.process(testConfig);
    const summaryUrl = page.url();
    let needsRefresh = false;
    for (const account of summary) {
      if (account.account.account_type == "Credit") {
        // If processing multiple accounts, we need to navigate back to the summary page
        if (needsRefresh) {
          await triggerNavigateAndWait(page, () => page.goto(summaryUrl, { waitUntil: "networkidle2" }));
        }
        await AccountDetailsWriter.process(testConfig, account.nav.data);
        needsRefresh = true;
      }
      else if (account.account.account_type == "Chequing") {
        // TODO: Chequing
      }
    }

    log.info(`Finished ${name}`);

  } catch (e) {
    log.error(e, `Failed to process ${name}`);
    errored.push(name);
    const date = DateTime.now().toFormat("yyyy-MM-dd");
    const errorFolder = `${baseFolder}/errors/${date}/`;
    mkdirSync(errorFolder, { recursive: true });
    await recorder.getPage().screenshot({ path: `${errorFolder}/${name}.png` });
  } finally {
    askUser[Symbol.dispose]();
    await Recorder.release();
    if (!errored.includes(name)) {
      successful.push(name);
    }
  }
}

log.info(`Successful: ${successful.join(", ")}`);
log.info(`Failed: ${errored.join(", ")}`);
