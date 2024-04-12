import { startPuppeteer } from './puppeteer';

// Start a new instance, wait for it to complete
export function warmup(url: string) {
  return new Promise<boolean>((resolve) => {
    startPuppeteer(false)
      .then(async ({browser, page}) => {
        page.goto(url);
        browser.on('disconnected', () => {
          console.log('disconnected');
          resolve(true);
        })
      })
  })
}
