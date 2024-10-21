import { ApiAction } from "./action";
import { closeBrowser } from "./scraper";

it ('finds elements with text', async () => {
  var action = await ApiAction.New('test');
  action.page.setContent("<html><body><table><tr><td>Confirmation Number</td><td>Other Number</td></tr></table></body></html>");
  var elements = await action.findElementsWithText('td', 'Number')
  expect(elements.length).toBe(2);
  await closeBrowser();
})
