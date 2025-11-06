// import { jest } from "@jest/globals"
// import { describe, IsManualRun } from '@thecointech/jestutils';
// import { useTestBrowser } from '../../internal/testutils';
// import { initDebuggingInfo } from '../../internal/debugging';

// jest.setTimeout(10 * 60 * 1000);

// const { getPage } = useTestBrowser();
// describe ('puppeteer', () => {
//   it ('passes stealth tests', async () => {
//     const page = await getPage();
//     initDebuggingInfo(page);

//     await Promise.all([
//       page.waitForNavigation({ waitUntil: 'networkidle2' }),
//       // page.goto('https://bot.sannysoft.com'),k
//       page.goto('https://www.wikipedia.com'),

//     ]);
//     console.log("Check the page.")

//     await new Promise((resolve) => {
//       setTimeout(resolve, 1000000);
//     });
//   })
// }, IsManualRun)
