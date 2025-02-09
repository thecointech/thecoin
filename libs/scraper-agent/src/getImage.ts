
import type { Page } from "puppeteer";

export async function _getImage(page: Page, fullPage: boolean = false, path?: string) {
  const existingViewport = page.viewport();
  if (fullPage) {
    await resizeViewportForPage(page);
  }
  const screenshot = await page.screenshot({ type: 'png', fullPage, path });
  if (fullPage) {
    await page.setViewport(existingViewport);
  }
  return screenshot;
}

async function resizeViewportForPage(page: Page) {
  // Get the maximum scroll height by checking all scrollable elements
  const maxScrollHeight = await page.evaluate(() => {
    const getScrollHeight = (element: Element) => {
      const { scrollHeight, clientHeight } = element;
      return Math.max(scrollHeight, clientHeight);
    };

    // Get all elements that might be scrollable
    const scrollableElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const style = window.getComputedStyle(el);
      return style.overflow === 'auto' || style.overflow === 'scroll' ||
              style.overflowY === 'auto' || style.overflowY === 'scroll';
    });

    // Get maximum height including the document itself
    const heights = [
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      ...scrollableElements.map(getScrollHeight)
    ];

    return Math.max(...heights);
  });

  // Set viewport height to match the maximum content height
  await page.setViewport({
    width: await page.evaluate(() => document.documentElement.clientWidth),
    height: maxScrollHeight,
    deviceScaleFactor: 1,
  });
}
