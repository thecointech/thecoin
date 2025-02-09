// import { Registry } from '@thecointech/scraper/record';
// import { LandingWriter } from './processors/landing';
// import { init } from './init';
// import { getConfig, TestConfig } from './config';
// import { TwoFAWriter } from './processors/twofa';
// import { AskUser } from './askUser';
// import { AccountSummaryWriter } from './processors/accountSummary';
// import { LoginWriter } from './processors/login';
// import { AccountDetailsWriter } from './processors/creditAccountDetails';
// import { PageIntentAug, ProcessConfig } from './types';
// import { TestSerializer } from './testSerializer';
// import { log } from '@thecointech/logging';
// import { _getPageIntent } from './testPageWriter';
// import { mkdirSync, writeFileSync } from 'fs';
// import { DateTime } from 'luxon';
// import { DummyAskUser } from './dummyAskUser';
// import { triggerNavigateAndWait } from './vqaResponse';
// import { SendETransferWriter } from './processors/sendETransfer';
// import { EventManager } from './eventManager';

// const { baseFolder, config } = getConfig();

// const clean = process.argv.includes("clean");
// const testFailedLogin = process.argv.includes("test-fail-login");
// const target = process.argv.includes("--target") ? process.argv[process.argv.indexOf("--target") + 1] : undefined;

// await init(clean);


// let successful = [];
// let errored = [];


// for (const [name, bankConfig] of Object.entries(config)) {

//   if (target && target != name) {
//     continue;
//   }
//   log.info(`Processing ${name}`);

//   const eventManager = new EventManager();
//   using askUser = new AskUser(bankConfig);

//   await using recorder = await Registry.create({
//     name,
//     headless: false,
//     onEvent: eventManager.onEvent
//   }, bankConfig.url);

//   const testConfig = {
//     eventManager,
//     recorder,
//     writer: new TestSerializer(name, baseFolder),
//     askUser: askUser
//   }

//   const cloneConfig = async (subName: string, options: Partial<ProcessConfig> = {}) => {
//     using _ = eventManager.pause();
//     const creditRecorder = await recorder.clone(subName);
//     return {
//       ...testConfig,
//       ...options,
//       recorder: creditRecorder,
//       async [Symbol.asyncDispose]() {
//         await creditRecorder[Symbol.asyncDispose]();
//       }
//     }
//   }

//   try {
//     const page = recorder.page;

//     if (clean) {
//       // CIBC/BMO somehow seem to fail when opening the first time
//       await triggerNavigateAndWait(page, () => page.reload({ waitUntil: "networkidle2" }));
//     }

//     let nextIntent: PageIntentAug = await LandingWriter.process(testConfig, clean);
//     if (nextIntent != "Login") {
//       throw new Error("Failed to get to Login");
//     }

//     // First, test a failed login
//     if (testFailedLogin) {
//       using _ = eventManager.pause();
//       await using failConfig = await cloneConfig("failedLogin", {
//         askUser: new DummyAskUser(bankConfig.bad_credentials)
//       });
//       let loginOutcome = await LoginWriter.process(failConfig);
//       if (loginOutcome != "LoginError") {
//         throw new Error("Failed to get to LoginError");
//       }
//     }

//     if (!bankConfig.username || !bankConfig.password) {
//       // We don't have details, so we're done.
//       continue;
//     }

//     // Next, test a successful login
//     let loginOutcome = await LoginWriter.process(testConfig);
//     switch(loginOutcome) {
//       case "LoginError":
//         throw new Error("Failed to login");
//       case "TwoFactorAuth":
//         nextIntent = await TwoFAWriter.process(testConfig);
//         break;
//       default:
//         nextIntent = await _getPageIntent(page);
//     }

//     // Next intent should be "AccountsSummary"
//     if (nextIntent != "AccountsSummary") {
//       const choice = await askUser.selectOption(`Expected to be on AccountsSummary, got ${nextIntent}. Should we continue?`, {
//         "Skip": [{ "cont": "Skip" }],
//         "Continue": [{ "cont": "Ignore" }],
//         "Throw": [{ "cont": "Throw" }]
//       }, "cont");
//       switch (choice.cont) {
//         case "Skip":
//           continue;
//         case "Throw":
//           throw new Error("Failed to get to AccountsSummary");
//       }
//     }



//     const summary = await AccountSummaryWriter.process(testConfig);
//     for (const account of summary) {
//       if (account.account.account_type == "Credit") {
//         await using creditRecorder = await cloneConfig("credit");
//         await AccountDetailsWriter.process(creditRecorder, account.nav.data);
//       }
//       else if (account.account.account_type == "Chequing") {
//         await using chequingRecorder = await cloneConfig("chequing");
//         await SendETransferWriter.process(chequingRecorder, account.account.account_number);
//       }
//     }

//     log.info(`Finished ${name}`);

//   } catch (e) {
//     log.error(e, `Failed to process ${name}`);
//     errored.push(name);
//     const date = DateTime.now().toFormat("yyyy-MM-dd");
//     const errorFolder = `${baseFolder}/errors/${date}/`;
//     mkdirSync(errorFolder, { recursive: true });
//     await recorder.page.screenshot({ path: `${errorFolder}/${name}.png` });
//   } finally {
//     if (!errored.includes(name)) {
//       successful.push(name);
//     }

//     mkdirSync(`${baseFolder}/events`, { recursive: true });
//     writeFileSync(`${baseFolder}/events/${name}.json`, JSON.stringify(eventManager.eventsList));
//   }
// }

// log.info(`Successful: ${successful.join(", ")}`);
// log.info(`Failed: ${errored.join(", ")}`);
