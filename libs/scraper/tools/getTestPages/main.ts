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
import { mkdirSync, writeFileSync } from 'fs';
import { DateTime } from 'luxon';
import { DummyAskUser } from './dummyAskUser';
import { triggerNavigateAndWait } from './vqaResponse';

const { baseFolder, config } = getConfig();

const clean = process.argv.includes("clean");
const testFailedLogin = process.argv.includes("test-fail-login");
const record = process.argv.includes("record");
const target = process.argv.includes("--target") ? process.argv[process.argv.indexOf("--target") + 1] : undefined;

await init(clean);


let successful = [];
let errored = [];

for (const [name, bankConfig] of Object.entries(config)) {

  if (target && target != name) {
    continue;
  }
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

    if (clean) {
      // CIBC/BMO somehow seem to fail when opening the first time
      await triggerNavigateAndWait(page, () => page.reload({ waitUntil: "networkidle2" }));
    }

    const testConfig = {
      recorder,
      writer: new TestSerializer(name, baseFolder),
      askUser: askUser
    }

    let nextIntent: PageIntentAug = await LandingWriter.process(testConfig, clean);
    if (nextIntent != "Login") {
      throw new Error("Failed to get to Login");
    }

    // First, test a failed login
    const loginUrl = page.url();
    if (testFailedLogin) {
      let loginOutcome = await LoginWriter.process({
        ...testConfig,
        askUser: new DummyAskUser(bankConfig.bad_credentials)
      });
      if (loginOutcome != "LoginError") {
        throw new Error("Failed to get to LoginError");
      }
    }
    if (!bankConfig.username || !bankConfig.password) {
      // We don't have details, so we're done.
      continue;
    }

    if (testFailedLogin) {
      await triggerNavigateAndWait(page, () => page.goto(loginUrl, { waitUntil: "networkidle2" }));
    }
    // Next, test a successful login
    let loginOutcome = await LoginWriter.process({
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

    let numScreenshots = 1;
    let recordMore = record;
    while (recordMore) {
      const choice = await askUser.selectOption("Select Choice (q to quit): ", {
        "Screenshot": [{ "cont": "Screenshot" }],
        "Dump Links": [{ "cont": "DumpLinks" }],
        "Quit": [{ "cont": "Quit" }],
      }, "cont");
      switch (choice.cont) {
        case "Screenshot":
          await page.screenshot({ path: `${baseFolder}/${name}-${numScreenshots++}.png`, fullPage: true });
          break;
        case "DumpLinks":
          const allLinks = await page.$$eval('a', (links) => links.map((link) => link.innerText));
          writeFileSync(`${baseFolder}/${name}-links.txt`, JSON.stringify(allLinks));
          break;
        case "Quit":
          recordMore = false;
          break;
      }
    }

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
