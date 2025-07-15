import { ApiAction } from "./action";
import { closeBrowser } from "./scraper";
import { describe } from "@thecointech/jestutils";

describe('ApiAction', () => {
  it ('finds elements with text', async () => {
    var action = await ApiAction.New('test');
    action.page.setContent("<html><body><table><tr><td>Confirmation Number</td><td>Other Number</td></tr></table></body></html>");
    var elements = await action.findElementsWithText('td', 'Number')
    expect(elements.length).toBe(2);
    await closeBrowser();
  })
}, !!process.env.JEST_CI) // Disable in CI due to puppeteer download timeout
